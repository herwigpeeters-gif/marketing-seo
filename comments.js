/**
 * comments.js - Interactive Page Editing & Commenting Widget for Executive SEO Hub
 * Allows end users to edit page text directly and manage persistent comments/feedback per page.
 */

(function () {
  'use strict';

  const PAGE_KEY = 'seo_hub_comments_' + window.location.pathname;
  const EDITS_KEY = 'seo_hub_edits_' + window.location.pathname;

  let isEditingMode = false;
  let comments = [];

  // Load saved comments from LocalStorage
  function loadComments() {
    try {
      const data = localStorage.getItem(PAGE_KEY);
      comments = data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading comments', e);
      comments = [];
    }
  }

  // Save comments to LocalStorage
  function saveComments() {
    try {
      localStorage.setItem(PAGE_KEY, JSON.stringify(comments));
    } catch (e) {
      console.error('Error saving comments', e);
    }
  }

  // Load saved inline edits
  function loadEdits() {
    try {
      const savedBody = localStorage.getItem(EDITS_KEY);
      if (savedBody) {
        const mainEl = document.querySelector('main') || document.body;
        mainEl.innerHTML = savedBody;
      }
    } catch (e) {
      console.error('Error loading edits', e);
    }
  }

  // Save inline edits
  function saveEdits() {
    try {
      const mainEl = document.querySelector('main') || document.body;
      localStorage.setItem(EDITS_KEY, mainEl.innerHTML);
      showToast('Page changes saved to local storage!');
    } catch (e) {
      console.error('Error saving edits', e);
    }
  }

  // Simple toast message
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 transition-opacity duration-300';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Create UI Controls
  function initUI() {
    // Inject floating button container
    const container = document.createElement('div');
    container.id = 'feedback-widget-container';
    container.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-2 font-sans';

    container.innerHTML = `
      <div id="edit-banner" class="hidden fixed top-0 left-0 right-0 bg-indigo-600 text-white text-xs py-2 px-4 text-center font-semibold shadow-md z-50 flex items-center justify-between">
        <span>✏️ <strong>Editing Mode Active:</strong> Click on any text on the page to edit it directly.</span>
        <div class="flex items-center gap-2">
          <button id="btn-save-edits" class="bg-white text-indigo-900 px-2.5 py-1 rounded text-xs font-bold hover:bg-slate-100 transition-colors">Save Page Edits</button>
          <button id="btn-reset-edits" class="bg-indigo-800 text-white px-2.5 py-1 rounded text-xs hover:bg-indigo-900 transition-colors">Reset Original</button>
        </div>
      </div>

      <button id="btn-toggle-edit" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105 border border-slate-700">
        <span>✏️</span> <span id="label-edit">Edit Page</span>
      </button>

      <button id="btn-toggle-comments" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105">
        <span>💬</span> <span>Comments (<span id="comment-count">0</span>)</span>
      </button>

      <div id="comment-drawer" class="hidden fixed top-0 right-0 h-full w-80 md:w-96 bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col font-sans">
        <div class="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">💬</span>
            <h3 class="font-bold text-sm">Page Feedback & Comments</h3>
          </div>
          <button id="btn-close-drawer" class="text-slate-400 hover:text-white text-lg font-bold">&times;</button>
        </div>

        <div class="p-4 border-b border-slate-100 bg-slate-50">
          <h4 class="text-xs font-bold text-slate-700 uppercase mb-2">Add New Comment</h4>
          <input id="input-author" type="text" placeholder="Your Name or Role (e.g. SEO Manager)" class="w-full text-xs p-2 mb-2 border border-slate-300 rounded focus:outline-none focus:border-indigo-500 bg-white" />
          <textarea id="input-text" rows="3" placeholder="Leave review feedback or suggested change..." class="w-full text-xs p-2 mb-2 border border-slate-300 rounded focus:outline-none focus:border-indigo-500 bg-white"></textarea>
          <button id="btn-submit-comment" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded text-xs transition-colors">
            Post Comment
          </button>
        </div>

        <div id="comments-list" class="flex-1 overflow-y-auto p-4 space-y-3">
          <!-- Comments render here -->
        </div>

        <div class="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <button id="btn-export-comments" class="text-indigo-600 hover:underline font-semibold">Copy All Feedback</button>
          <button id="btn-clear-comments" class="text-slate-500 hover:text-red-600">Clear Comments</button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Event listeners
    document.getElementById('btn-toggle-edit').addEventListener('click', toggleEditMode);
    document.getElementById('btn-save-edits').addEventListener('click', saveEdits);
    document.getElementById('btn-reset-edits').addEventListener('click', resetEdits);
    document.getElementById('btn-toggle-comments').addEventListener('click', toggleDrawer);
    document.getElementById('btn-close-drawer').addEventListener('click', toggleDrawer);
    document.getElementById('btn-submit-comment').addEventListener('click', addComment);
    document.getElementById('btn-export-comments').addEventListener('click', exportComments);
    document.getElementById('btn-clear-comments').addEventListener('click', clearComments);

    updateCommentCount();
    renderComments();
  }

  // Toggle Editing Mode
  function toggleEditMode() {
    isEditingMode = !isEditingMode;
    const banner = document.getElementById('edit-banner');
    const label = document.getElementById('label-edit');
    const mainEl = document.querySelector('main') || document.body;

    if (isEditingMode) {
      banner.classList.remove('hidden');
      label.innerText = 'Exit Editing';
      mainEl.contentEditable = 'true';
      showToast('Editing mode activated! Click any text to edit.');
    } else {
      banner.classList.add('hidden');
      label.innerText = 'Edit Page';
      mainEl.contentEditable = 'false';
      saveEdits();
    }
  }

  // Reset Edits to Original
  function resetEdits() {
    if (confirm('Reset page to original content? Unsaved edits will be lost.')) {
      localStorage.removeItem(EDITS_KEY);
      window.location.reload();
    }
  }

  // Toggle Drawer
  function toggleDrawer() {
    const drawer = document.getElementById('comment-drawer');
    drawer.classList.toggle('hidden');
  }

  // Add Comment
  function addComment() {
    const authorInput = document.getElementById('input-author');
    const textInput = document.getElementById('input-text');

    const author = authorInput.value.trim() || 'Anonymous Reviewer';
    const text = textInput.value.trim();

    if (!text) {
      showToast('Please enter comment text.');
      return;
    }

    const newComment = {
      id: Date.now(),
      author: author,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
    };

    comments.unshift(newComment);
    saveComments();
    textInput.value = '';
    updateCommentCount();
    renderComments();
    showToast('Comment added!');
  }

  // Delete Comment
  window.deleteComment = function (id) {
    comments = comments.filter(c => c.id !== id);
    saveComments();
    updateCommentCount();
    renderComments();
  };

  // Render Comments List
  function renderComments() {
    const list = document.getElementById('comments-list');
    if (!list) return;

    if (comments.length === 0) {
      list.innerHTML = `
        <div class="text-center py-8 text-slate-400 text-xs">
          <p>No comments yet.</p>
          <p class="mt-1">Add feedback or requested edits above!</p>
        </div>
      `;
      return;
    }

    list.innerHTML = comments.map(c => `
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm text-xs relative group">
        <div class="flex items-center justify-between mb-1">
          <span class="font-bold text-slate-800">${escapeHtml(c.author)}</span>
          <span class="text-slate-400 text-[10px]">${c.timestamp}</span>
        </div>
        <p class="text-slate-600 leading-relaxed">${escapeHtml(c.text)}</p>
        <button onclick="deleteComment(${c.id})" class="mt-2 text-[10px] text-red-500 hover:underline">Delete</button>
      </div>
    `).join('');
  }

  function updateCommentCount() {
    const countEl = document.getElementById('comment-count');
    if (countEl) {
      countEl.innerText = comments.length;
    }
  }

  function exportComments() {
    if (comments.length === 0) {
      showToast('No comments to export.');
      return;
    }
    const summary = comments.map(c => `[${c.timestamp}] ${c.author}: ${c.text}`).join('\n');
    navigator.clipboard.writeText(summary).then(() => {
      showToast('Comments copied to clipboard!');
    }).catch(() => {
      alert(summary);
    });
  }

  function clearComments() {
    if (confirm('Clear all comments for this page?')) {
      comments = [];
      saveComments();
      updateCommentCount();
      renderComments();
      showToast('Comments cleared.');
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadEdits();
      loadComments();
      initUI();
    });
  } else {
    loadEdits();
    loadComments();
    initUI();
  }
})();
