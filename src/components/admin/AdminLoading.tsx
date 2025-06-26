
import React from 'react';

const AdminLoading = () => {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bsl-teal"></div>
      <span className="ml-3 text-bsl-brown">Loading admin panel...</span>
    </div>
  );
};

export default AdminLoading;
