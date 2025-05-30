
import React from 'react';

const AdminLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bsl-teal"></div>
    </div>
  );
};

export default AdminLoading;
