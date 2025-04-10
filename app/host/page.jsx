"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabaseClient" // Import Supabase client to fetch user data
import { Search } from "lucide-react" // Import search icon

export default function HostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null) // State for the selected user
  const [searchQuery, setSearchQuery] = useState("") // State for search query

  const allowedEmails = ["codecraftcreate.dev@gmail.com"]
  const supabase = createClient()

  useEffect(() => {
    if (status === "loading") return

    // If not logged in or not an allowed user, redirect to the registration page
    if (!session || !allowedEmails.includes(session.user.email)) {
      router.replace("/")
      return
    }

    // Fetch user data from Supabase
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*")
      if (error) {
        console.error("Error fetching users:", error.message)
      } else {
        setUsers(data)
        setFilteredUsers(data) // Initialize filtered users with all users
      }
    }

    fetchUsers()
  }, [session, status, router, supabase])

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users) // If search is empty, show all users
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = users.filter(
      (user) =>
        // Search in lucky number (convert to string first)
        user.lucky_number?.toString().includes(query) ||
        // Search in name
        user.name
          ?.toLowerCase()
          .includes(query) ||
        // Search in email
        user.email
          ?.toLowerCase()
          .includes(query) ||
        // Search in phone
        user.phone
          ?.toLowerCase()
          .includes(query),
    )

    setFilteredUsers(filtered)
  }, [searchQuery, users])

  const handleBoxClick = (user) => {
    setSelectedUser(user) // Set the selected user to show in the modal
  }

  const handleCloseModal = () => {
    setSelectedUser(null) // Close the modal by resetting the selected user
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Prevent "Checking access" when session is not available
  if (status === "loading" || !session) {
    return null // Don't render anything when loading or if no session exists
  }

  if (!allowedEmails.includes(session?.user?.email)) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <p className="animate-pulse">Access Denied</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 relative pb-16">
      {/* Header with title and logout */}
      <div className="flex justify-between items-start mb-16">
        <div>
          <h1 className="text-4xl font-black">Host Dashboard</h1>
        </div>

        {/* Logout button positioned at the top right */}
        <button
          onClick={() => signOut()}
          className="text-red-600 font-semibold hover:text-red-500 transition-all duration-200"
        >
          Logout
        </button>
      </div>

      {/* Search bar positioned at the top right below logout */}
      <div className="absolute top-16 right-6 mt-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="bg-[#404d68] text-white w-48 pl-8 pr-2 py-1 rounded-lg border-0 focus:outline-none focus:ring-0 text-sm"
          />
        </div>
      </div>

      {/* Display clickable boxes with user data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.email}
              className="bg-[#131824] text-white rounded-lg shadow-lg p-3 cursor-pointer hover:bg-gray-200 hover:text-black transition-all duration-200"
              onClick={() => handleBoxClick(user)} // Open modal when box is clicked
            >
              <h1 className="text-sm text-center font-bold">Lucky Number</h1>
              <h3 className="text-4xl font-black text-center">{user.lucky_number}</h3>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-400">No users found matching your search.</p>
          </div>
        )}
      </div>

      {/* Fixed position results count at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 py-3 bg-black text-center">
        <p className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Modal for displaying user details */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center"
          onClick={handleCloseModal} // Close when clicking the overlay
        >
          <div
            className="bg-white text-black rounded-lg p-6 w-96 max-w-full relative"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
          >
            {/* Cross icon positioned at the top right of the modal */}
            <button onClick={handleCloseModal} className="absolute top-0.5 right-2 text-black font-normal text-2xl">
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">User Details</h2>
            <p>
              <strong>Name:</strong> {selectedUser.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedUser.phone}
            </p>
            <p>
              <strong>Lucky Number:</strong> {selectedUser.lucky_number}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
