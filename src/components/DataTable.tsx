
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BreedLegislation } from '@/types';
import { ExternalLink } from 'lucide-react';

interface DataTableProps {
  data: BreedLegislation[];
}

const DataTable = ({ data }: DataTableProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-dogdata-muted">
              <TableHead className="font-semibold">Municipality</TableHead>
              <TableHead className="font-semibold">State</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Banned Breeds</TableHead>
              <TableHead className="font-semibold">Ordinance</TableHead>
              <TableHead className="font-semibold">Population</TableHead>
              <TableHead className="font-semibold">Verification Date</TableHead>
              <TableHead className="font-semibold">Ordinance URL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-dogdata-text">
                  No data found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="hover:bg-dogdata-background">
                  <TableCell className="font-medium">{item.municipality}</TableCell>
                  <TableCell>{item.state}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.bannedBreeds.map((breed, idx) => (
                        <Badge key={idx} variant="outline" className="bg-dogdata-muted text-dogdata-text">
                          {breed}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{item.ordinance}</TableCell>
                  <TableCell>
                    {item.population ? item.population.toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell>{formatDate(item.verificationDate)}</TableCell>
                  <TableCell>
                    {item.ordinanceUrl ? (
                      <a
                        href={item.ordinanceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-dogdata-blue hover:text-dogdata-bluelight"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
