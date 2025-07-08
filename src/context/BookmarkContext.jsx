import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';
import { useAuth } from './AuthContext';

const BookmarkContext = createContext();

export function useBookmarks() {
  return useContext(BookmarkContext);
}

export function BookmarkProvider({ children }) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all user data when authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching data for:', user.id);
      fetchUserData();
    } else {
      // Reset state when user logs out
      setBookmarks([]);
      setCategories([]);
      setTags([]);
      setLoading(false);
    }
  }, [user]);

  // Fetch all user data (bookmarks, categories, tags)
  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching user data...');
      await Promise.all([
        fetchBookmarks(),
        fetchCategories(),
        fetchTags()
      ]);
      console.log('User data fetched successfully');
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookmarks with their tags
  const fetchBookmarks = async () => {
    try {
      console.log('Fetching bookmarks...');
      
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('bookmarks_bk4576hgty')
        .select('*, category:category_id(*)')
        .order('created_at', { ascending: false });

      if (bookmarksError) {
        console.error('Bookmarks fetch error:', bookmarksError);
        throw bookmarksError;
      }

      console.log('Raw bookmarks data:', bookmarksData);

      // For each bookmark, fetch its tags
      const bookmarksWithTags = await Promise.all(
        bookmarksData.map(async (bookmark) => {
          const { data: tagData, error: tagError } = await supabase
            .from('bookmark_tags_bk4576hgty')
            .select('tag_id, tags_bk4576hgty!inner(*)')
            .eq('bookmark_id', bookmark.id);

          if (tagError) {
            console.error('Tag fetch error for bookmark:', bookmark.id, tagError);
            // Don't throw error for tags, just continue with empty tags
            return { ...bookmark, tags: [] };
          }

          const tags = tagData.map(t => t.tags_bk4576hgty);
          return { ...bookmark, tags };
        })
      );

      console.log('Bookmarks with tags:', bookmarksWithTags);
      setBookmarks(bookmarksWithTags);
      return bookmarksWithTags;
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load your bookmarks');
      throw err;
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      
      const { data, error } = await supabase
        .from('categories_bk4576hgty')
        .select('*')
        .order('name');

      if (error) {
        console.error('Categories fetch error:', error);
        throw error;
      }

      console.log('Categories data:', data);
      setCategories(data);
      return data;
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load your categories');
      throw err;
    }
  };

  // Fetch tags
  const fetchTags = async () => {
    try {
      console.log('Fetching tags...');
      
      const { data, error } = await supabase
        .from('tags_bk4576hgty')
        .select('*')
        .order('name');

      if (error) {
        console.error('Tags fetch error:', error);
        throw error;
      }

      console.log('Tags data:', data);
      setTags(data);
      return data;
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load your tags');
      throw err;
    }
  };

  // Add bookmark with proper tag handling
  const addBookmark = async (bookmarkData) => {
    console.log('=== ADD BOOKMARK START ===');
    console.log('User ID:', user?.id);
    console.log('Bookmark data received:', bookmarkData);
    
    if (!user?.id) {
      console.error('No user ID available');
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Prepare bookmark data for insertion
      const bookmarkToInsert = {
        user_id: user.id,
        url: bookmarkData.url,
        title: bookmarkData.title,
        description: bookmarkData.description || null,
        thumbnail_url: bookmarkData.thumbnail_url || null,
        category_id: bookmarkData.category_id || null,
        rating: bookmarkData.rating || 0,
        status: bookmarkData.status || 'unwatched',
        notes: bookmarkData.notes || null
      };

      console.log('Prepared bookmark for insertion:', bookmarkToInsert);

      // Insert the bookmark first
      const { data: bookmark, error: bookmarkError } = await supabase
        .from('bookmarks_bk4576hgty')
        .insert([bookmarkToInsert])
        .select()
        .single();

      if (bookmarkError) {
        console.error('Bookmark insertion error:', bookmarkError);
        throw bookmarkError;
      }

      console.log('Bookmark inserted successfully:', bookmark);

      // Handle tags if present
      if (bookmarkData.tags && bookmarkData.tags.length > 0) {
        console.log('Processing tags:', bookmarkData.tags);
        
        // Process each tag and get proper UUIDs
        const tagIds = [];
        
        for (const tag of bookmarkData.tags) {
          let tagId = tag.id;
          
          // Check if this is a temporary tag ID (starts with 'temp-')
          if (!tagId || tagId.startsWith('temp-')) {
            console.log('Creating new tag:', tag.name);
            
            // First check if tag already exists
            const { data: existingTags, error: checkError } = await supabase
              .from('tags_bk4576hgty')
              .select('id')
              .eq('user_id', user.id)
              .eq('name', tag.name)
              .limit(1);

            if (checkError) {
              console.error('Error checking existing tags:', checkError);
              throw checkError;
            }

            if (existingTags && existingTags.length > 0) {
              // Tag already exists, use its ID
              tagId = existingTags[0].id;
              console.log('Using existing tag:', tagId);
            } else {
              // Create new tag
              const { data: newTag, error: tagError } = await supabase
                .from('tags_bk4576hgty')
                .insert([{ user_id: user.id, name: tag.name }])
                .select('id')
                .single();

              if (tagError) {
                console.error('Tag creation error:', tagError);
                throw tagError;
              }
              
              tagId = newTag.id;
              console.log('New tag created with ID:', tagId);
            }
          }

          // Verify we have a valid UUID
          if (tagId && typeof tagId === 'string' && tagId.length > 0 && !tagId.startsWith('temp-')) {
            tagIds.push(tagId);
          } else {
            console.error('Invalid tag ID:', tagId);
          }
        }

        // Now create bookmark-tag relationships with valid UUIDs
        if (tagIds.length > 0) {
          console.log('Creating bookmark-tag relations with IDs:', tagIds);
          
          const bookmarkTagRelations = tagIds.map(tagId => ({
            bookmark_id: bookmark.id,
            tag_id: tagId
          }));

          const { error: relationError } = await supabase
            .from('bookmark_tags_bk4576hgty')
            .insert(bookmarkTagRelations);

          if (relationError) {
            console.error('Bookmark-tag relation error:', relationError);
            throw relationError;
          }

          console.log('Bookmark-tag relations created successfully');
        }
      }

      // Record analytics
      console.log('Recording analytics...');
      const { error: analyticsError } = await supabase
        .from('analytics_bk4576hgty')
        .insert([{
          user_id: user.id,
          bookmark_id: bookmark.id,
          action: 'create'
        }]);

      if (analyticsError) {
        console.warn('Analytics recording failed (non-critical):', analyticsError);
      }

      // Refresh bookmark list and tags
      console.log('Refreshing data...');
      await Promise.all([
        fetchBookmarks(),
        fetchTags()
      ]);
      
      console.log('=== ADD BOOKMARK SUCCESS ===');
      return { success: true, bookmark };

    } catch (err) {
      console.error('=== ADD BOOKMARK ERROR ===');
      console.error('Error details:', err);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Error hint:', err.hint);
      console.error('Error details:', err.details);
      
      return { success: false, error: err.message || 'Failed to add bookmark' };
    }
  };

  // Update bookmark with proper tag handling
  const updateBookmark = async (id, bookmarkData) => {
    console.log('=== UPDATE BOOKMARK START ===');
    console.log('Bookmark ID:', id);
    console.log('Update data:', bookmarkData);
    
    try {
      // Update the bookmark
      const { data: bookmark, error: bookmarkError } = await supabase
        .from('bookmarks_bk4576hgty')
        .update({
          ...bookmarkData,
          tags: undefined, // Remove tags from the update data
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (bookmarkError) {
        console.error('Bookmark update error:', bookmarkError);
        throw bookmarkError;
      }

      console.log('Bookmark updated successfully:', bookmark);

      // Handle tags if present
      if (bookmarkData.tags !== undefined) {
        console.log('Updating tags for bookmark:', id);
        
        // Delete existing tag relations
        const { error: deleteError } = await supabase
          .from('bookmark_tags_bk4576hgty')
          .delete()
          .eq('bookmark_id', id);

        if (deleteError) {
          console.error('Error deleting existing tag relations:', deleteError);
          throw deleteError;
        }

        // Add new tag relations
        if (bookmarkData.tags && bookmarkData.tags.length > 0) {
          const tagIds = [];
          
          for (const tag of bookmarkData.tags) {
            let tagId = tag.id;
            
            // Check if this is a temporary tag ID
            if (!tagId || tagId.startsWith('temp-')) {
              console.log('Creating new tag during update:', tag.name);
              
              // Check if tag already exists
              const { data: existingTags, error: checkError } = await supabase
                .from('tags_bk4576hgty')
                .select('id')
                .eq('user_id', user.id)
                .eq('name', tag.name)
                .limit(1);

              if (checkError) throw checkError;

              if (existingTags && existingTags.length > 0) {
                tagId = existingTags[0].id;
              } else {
                const { data: newTag, error: tagError } = await supabase
                  .from('tags_bk4576hgty')
                  .insert([{ user_id: user.id, name: tag.name }])
                  .select('id')
                  .single();

                if (tagError) throw tagError;
                tagId = newTag.id;
              }
            }

            if (tagId && !tagId.startsWith('temp-')) {
              tagIds.push(tagId);
            }
          }

          // Create bookmark-tag relationships
          if (tagIds.length > 0) {
            const bookmarkTagRelations = tagIds.map(tagId => ({
              bookmark_id: id,
              tag_id: tagId
            }));

            const { error: relationError } = await supabase
              .from('bookmark_tags_bk4576hgty')
              .insert(bookmarkTagRelations);

            if (relationError) throw relationError;
          }
        }
      }

      // Record analytics
      await supabase
        .from('analytics_bk4576hgty')
        .insert([{
          user_id: user.id,
          bookmark_id: id,
          action: 'update'
        }]);

      // Refresh bookmark list and tags
      await Promise.all([
        fetchBookmarks(),
        fetchTags()
      ]);
      
      console.log('=== UPDATE BOOKMARK SUCCESS ===');
      return { success: true, bookmark };

    } catch (err) {
      console.error('=== UPDATE BOOKMARK ERROR ===');
      console.error('Error details:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete bookmark
  const deleteBookmark = async (id) => {
    try {
      console.log('Deleting bookmark:', id);
      
      // Record analytics before deletion
      await supabase
        .from('analytics_bk4576hgty')
        .insert([{
          user_id: user.id,
          bookmark_id: id,
          action: 'delete'
        }]);

      // Delete the bookmark (cascade will handle tags)
      const { error } = await supabase
        .from('bookmarks_bk4576hgty')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh bookmark list
      await fetchBookmarks();
      return { success: true };
      
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete multiple bookmarks
  const deleteMultipleBookmarks = async (ids) => {
    try {
      console.log('Deleting multiple bookmarks:', ids);
      
      // Record analytics for each deletion
      const analyticsEntries = ids.map(id => ({
        user_id: user.id,
        bookmark_id: id,
        action: 'delete'
      }));
      
      await supabase
        .from('analytics_bk4576hgty')
        .insert(analyticsEntries);

      // Delete the bookmarks
      const { error } = await supabase
        .from('bookmarks_bk4576hgty')
        .delete()
        .in('id', ids);

      if (error) throw error;

      // Refresh bookmark list
      await fetchBookmarks();
      return { success: true };
      
    } catch (err) {
      console.error('Error deleting multiple bookmarks:', err);
      return { success: false, error: err.message };
    }
  };

  // Update bookmark status in bulk
  const updateMultipleBookmarkStatus = async (ids, status) => {
    try {
      console.log('Updating multiple bookmark statuses:', { ids, status });
      
      // Update the bookmarks
      const { error } = await supabase
        .from('bookmarks_bk4576hgty')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .in('id', ids);

      if (error) throw error;

      // Record analytics for each update
      const analyticsEntries = ids.map(id => ({
        user_id: user.id,
        bookmark_id: id,
        action: `update_status_${status}`
      }));
      
      await supabase
        .from('analytics_bk4576hgty')
        .insert(analyticsEntries);

      // Refresh bookmark list
      await fetchBookmarks();
      return { success: true };
      
    } catch (err) {
      console.error('Error updating multiple bookmark statuses:', err);
      return { success: false, error: err.message };
    }
  };

  // Add category
  const addCategory = async (categoryData) => {
    try {
      console.log('Adding category:', categoryData);
      
      const { data, error } = await supabase
        .from('categories_bk4576hgty')
        .insert([{ user_id: user.id, ...categoryData }])
        .select();

      if (error) throw error;

      await fetchCategories();
      return { success: true, category: data[0] };
      
    } catch (err) {
      console.error('Error adding category:', err);
      return { success: false, error: err.message };
    }
  };

  // Update category
  const updateCategory = async (id, categoryData) => {
    try {
      console.log('Updating category:', { id, categoryData });
      
      const { data, error } = await supabase
        .from('categories_bk4576hgty')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Refresh categories and bookmarks to reflect changes
      await Promise.all([
        fetchCategories(),
        fetchBookmarks()
      ]);
      
      return { success: true, category: data[0] };
      
    } catch (err) {
      console.error('Error updating category:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    try {
      console.log('Deleting category:', id);
      
      // First update any bookmarks using this category
      await supabase
        .from('bookmarks_bk4576hgty')
        .update({ category_id: null })
        .eq('category_id', id);

      // Then delete the category
      const { error } = await supabase
        .from('categories_bk4576hgty')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh categories and bookmarks to reflect changes
      await Promise.all([
        fetchCategories(),
        fetchBookmarks()
      ]);
      
      return { success: true };
      
    } catch (err) {
      console.error('Error deleting category:', err);
      return { success: false, error: err.message };
    }
  };

  // Add tag
  const addTag = async (tagName) => {
    try {
      console.log('Adding tag:', tagName);
      
      const { data, error } = await supabase
        .from('tags_bk4576hgty')
        .insert([{ user_id: user.id, name: tagName }])
        .select();

      if (error) throw error;

      await fetchTags();
      return { success: true, tag: data[0] };
      
    } catch (err) {
      console.error('Error adding tag:', err);
      return { success: false, error: err.message };
    }
  };

  // Update tag
  const updateTag = async (id, tagName) => {
    try {
      console.log('Updating tag:', { id, tagName });
      
      const { data, error } = await supabase
        .from('tags_bk4576hgty')
        .update({ name: tagName })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Refresh tags and bookmarks to reflect changes
      await Promise.all([
        fetchTags(),
        fetchBookmarks()
      ]);
      
      return { success: true, tag: data[0] };
      
    } catch (err) {
      console.error('Error updating tag:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete tag
  const deleteTag = async (id) => {
    try {
      console.log('Deleting tag:', id);
      
      // First delete tag relations
      await supabase
        .from('bookmark_tags_bk4576hgty')
        .delete()
        .eq('tag_id', id);

      // Then delete the tag
      const { error } = await supabase
        .from('tags_bk4576hgty')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh tags and bookmarks to reflect changes
      await Promise.all([
        fetchTags(),
        fetchBookmarks()
      ]);
      
      return { success: true };
      
    } catch (err) {
      console.error('Error deleting tag:', err);
      return { success: false, error: err.message };
    }
  };

  // Fetch analytics data for charts
  const fetchAnalytics = async () => {
    try {
      console.log('Fetching analytics...');
      
      const { data, error } = await supabase
        .from('analytics_bk4576hgty')
        .select('*, bookmark:bookmark_id(category_id, status)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Analytics data:', data);
      return { success: true, data };
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      return { success: false, error: err.message };
    }
  };

  // Update bookmark AI summary
  const updateBookmarkSummary = async (id, summary) => {
    try {
      console.log('Updating bookmark summary:', { id, summary });
      
      const { data, error } = await supabase
        .from('bookmarks_bk4576hgty')
        .update({ 
          ai_summary: summary,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Record analytics
      await supabase
        .from('analytics_bk4576hgty')
        .insert([{
          user_id: user.id,
          bookmark_id: id,
          action: 'generate_summary'
        }]);

      // Refresh bookmarks to reflect changes
      await fetchBookmarks();
      return { success: true, bookmark: data[0] };
      
    } catch (err) {
      console.error('Error updating bookmark summary:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    bookmarks,
    categories,
    tags,
    loading,
    error,
    fetchUserData,
    fetchBookmarks,
    fetchCategories,
    fetchTags,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    deleteMultipleBookmarks,
    updateMultipleBookmarkStatus,
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    updateTag,
    deleteTag,
    fetchAnalytics,
    updateBookmarkSummary
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}