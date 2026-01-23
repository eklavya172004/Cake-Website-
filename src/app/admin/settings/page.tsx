'use client';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Platform configuration and administration</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Accounts</h3>
          <p className="text-gray-600 text-sm mb-4">Manage admin users and permissions</p>
          <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            Manage Admins
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Settings</h3>
          <p className="text-gray-600 text-sm mb-4">Configure payment gateway and accounts</p>
          <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            Payment Config
          </button>
        </div>
      </div>
    </div>
  );
}
