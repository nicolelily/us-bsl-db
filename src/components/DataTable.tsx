
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
import { ReportUpdateButton } from './submissions/ReportUpdateButton';

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
              <TableHead className="font-semibold w-32">Municipality</TableHead>
              <TableHead className="font-semibold w-20">State</TableHead>
              <TableHead className="font-semibold w-20">Municipality</TableHead>
              <TableHead className="font-semibold w-24">Legislation</TableHead>
              <TableHead className="font-semibold w-40">Banned Breeds</TableHead>
              <TableHead className="font-semibold w-64">Ordinance</TableHead>
              <TableHead className="font-semibold w-24">Population</TableHead>
              <TableHead className="font-semibold w-32">Verification Date</TableHead>
              <TableHead className="font-semibold w-24">Ordinance URL</TableHead>
              <TableHead className="font-semibold w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-dogdata-text">
                  No data found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="hover:bg-dogdata-background">
                  <TableCell className="font-medium">{item.municipality}</TableCell>
                  <TableCell>{item.state}</TableCell>
                  <TableCell>{item.municipalityType}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.legislationType === 'ban' ? 'destructive' : 'secondary'}
                      className={`capitalize ${
                        item.legislationType === 'restriction' 
                          ? 'bg-[#74CFC5] text-white hover:bg-[#5fb8ad]' 
                          : item.legislationType === 'repealed'
                          ? 'bg-[#C5763D] text-white border-[#C5763D] hover:bg-[#b5662d]'
                          : ''
                      }`}
                    >
                      {item.legislationType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.bannedBreeds.map((breed, idx) => (
                        <Badge key={idx} variant="outline" className="bg-dogdata-muted text-dogdata-text">
                          {breed}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-64 break-words">{item.ordinance}</TableCell>
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
                  <TableCell>
                    <ReportUpdateButton 
                      record={item} 
                      variant="ghost" 
                      size="sm"
                      showLabel={false}
                    />
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
