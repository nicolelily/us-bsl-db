
import React from 'react';
import { MapPin, Database, FileText, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-dogdata-blue text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-xl md:text-2xl font-bold">U.S. Breed Legislation Compass</h1>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="flex items-center px-3 py-2 rounded hover:bg-dogdata-bluelight transition-colors">
            <Database className="mr-2" size={18} />
            <span>Data Table</span>
          </Link>
          <Link to="/map" className="flex items-center px-3 py-2 rounded hover:bg-dogdata-bluelight transition-colors">
            <MapPin className="mr-2" size={18} />
            <span>Map View</span>
          </Link>
          <Link to="/stats" className="flex items-center px-3 py-2 rounded hover:bg-dogdata-bluelight transition-colors">
            <FileText className="mr-2" size={18} />
            <span>Statistics</span>
          </Link>
          <Link to="/about" className="flex items-center px-3 py-2 rounded hover:bg-dogdata-bluelight transition-colors">
            <Info className="mr-2" size={18} />
            <span>About</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
