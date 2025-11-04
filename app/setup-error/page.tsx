export default function SetupErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-900 mb-2">Configuration Error</h1>
        <p className="text-red-700 mb-4">Missing Supabase environment variables. Please check the following:</p>
        <ul className="text-left bg-white rounded-lg p-4 mb-4 border border-red-200">
          <li className="mb-2">
            <code className="bg-red-100 px-2 py-1 rounded text-sm">NEXT_PUBLIC_SUPABASE_URL</code>
          </li>
          <li>
            <code className="bg-red-100 px-2 py-1 rounded text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </li>
        </ul>
        <p className="text-sm text-gray-600">
          These variables should be automatically set up when you connect Supabase. Check the "Connect" section in the
          sidebar.
        </p>
      </div>
    </div>
  )
}
