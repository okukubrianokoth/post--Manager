// Base URL for json-server API
const BASE_URL = "http://localhost:3000";

// Global variables
let posts = [];          // Array to store all posts
let currentPost = null;  // The post currently selected

// Fetch all posts from the server
async function fetchPosts() {
  try {
    const res = await fetch(`${BASE_URL}/posts`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    posts = await res.json(); 
  } catch (error) {
    alert(error.message); 
  }
}

// Render all post titles in the left sidebar
function displayPosts() {
  const postList = document.getElementById("post-list");
  postList.innerHTML = ""; // Clear existing list

  posts.forEach(post => {
    const div = document.createElement("div");
    div.textContent = post.title;
    div.classList.add("post-item");

    // Highlight currently selected post
    if (currentPost && post.id === currentPost.id) {
      div.classList.add("selected");
    }

    // Add click event to load post details
    div.addEventListener("click", () => {
      showPostDetails(post);
    });

    postList.appendChild(div); 
  });
}

// Display details for the selected post
function showPostDetails(post) {
  currentPost = post;
  const postDetail = document.getElementById("post-detail");

  // Inject post content and edit form into DOM
  postDetail.innerHTML = `
    <h2>${post.title}</h2>
    <p><strong>Author:</strong> ${post.author}</p>
    <p>${post.content}</p>
    <button id="edit-btn">Edit</button>
    <button id="delete-btn">Delete</button>
    <form id="edit-post-form" class="hidden">
      <label for="edit-title">Title:</label>
      <input type="text" id="edit-title" value="${post.title}" required />

      <label for="edit-content">Content:</label>
      <textarea id="edit-content" rows="5" required>${post.content}</textarea>

      <button type="submit" id="edit-submit-btn">Update Post</button>
      <button type="button" id="edit-cancel-btn">Cancel</button>
    </form>
  `;

  displayPosts(); // Refresh sidebar and highlight selected post

  // Edit button: Show the edit form
  document.getElementById("edit-btn").addEventListener("click", () => {
    document.getElementById("edit-post-form").classList.remove("hidden");
    document.getElementById("edit-btn").style.display = "none";
    document.getElementById("delete-btn").style.display = "none";
  });

  // Cancel button: Hide edit form and show original buttons
  document.getElementById("edit-cancel-btn").addEventListener("click", () => {
    document.getElementById("edit-post-form").classList.add("hidden");
    document.getElementById("edit-btn").style.display = "inline-block";
    document.getElementById("delete-btn").style.display = "inline-block";
  });

  //  Submit edited post
  document.getElementById("edit-post-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop form from refreshing the page

    // Get updated values from inputs
    const updatedTitle = document.getElementById("edit-title").value.trim();
    const updatedContent = document.getElementById("edit-content").value.trim();

    if (!updatedTitle || !updatedContent) {
      alert("Title and content cannot be empty.");
      return;
    }

    try {
      // Send PATCH request to update the post
      const res = await fetch(`${BASE_URL}/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTitle,
          content: updatedContent,
        }),
      });

      if (!res.ok) throw new Error("Failed to update post");

      const updatedPost = await res.json();

      // Replace updated post in the local posts array
      posts = posts.map(p => (p.id === updatedPost.id ? updatedPost : p));
      showPostDetails(updatedPost); 
    } catch (error) {
      alert(error.message);
    }
  });

  // Delete button: Remove post
  document.getElementById("delete-btn").addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`${BASE_URL}/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete post");

      // Remove from local list and refresh UI
      posts = posts.filter(p => p.id !== post.id);
      currentPost = null;
      displayPosts();

      // Show default message
      document.getElementById("post-detail").innerHTML = "<p>Select a post to see details here.</p>";
    } catch (error) {
      alert(error.message);
    }
  });
}

// ➕ Handle form for adding new posts
function addNewPostListener() {
  const form = document.getElementById("new-post-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get input values
    const title = document.getElementById("new-title").value.trim();
    const content = document.getElementById("new-content").value.trim();
    const author = document.getElementById("new-author").value.trim();

    if (!title || !content || !author) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // Send POST request to add new post
      const res = await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author }),
      });

      if (!res.ok) throw new Error("Failed to add post");

      const newPost = await res.json();
      posts.push(newPost); 

      form.reset();               
      showPostDetails(newPost);   
      displayPosts();             
    } catch (error) {
      alert(error.message);
    }
  });
}

//  Main function: runs on page load
async function main() {
  await fetchPosts(); 
  displayPosts();         

  if (posts.length > 0) {
    showPostDetails(posts[0]);
  }

   // Enable "Add New Post" form
  addNewPostListener();  
}

//  Run main() after HTML fully loads
document.addEventListener("DOMContentLoaded", main);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").then(registration => {
      console.log("✅ Service Worker registered: ", registration);
    }).catch(error => {
      console.log("❌ Service Worker registration failed: ", error);
    });
  });
}
