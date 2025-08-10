import { useState, useEffect } from 'react';
import { FiAlertCircle, FiFilter, FiSearch } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Dropdown from '@/components/common/Dropdown';
import EmptyState from '@/components/common/EmptyState';
import ReportItem from './ReportItem';
import ReportDetailsModal from './ReportDetailsModal';
import BulkActionsToolbar from './BulkActionsToolbar';

export default function ReportList({ reports, onResolveReport, onEscalateReport }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReports, setSelectedReports] = useState([]);
  const [sortOption, setSortOption] = useState('recent');

  // Filtros avançados
  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = report.reason.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         report.reportedContent?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Ordenação
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortOption === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOption === 'priority') return b.severity - a.severity;
    return 0;
  });

  // Bulk actions
  const handleBulkResolve = () => {
    // Implementar lógica para resolver múltiplos reports
    onResolveReport(selectedReports.map(r => r.reportId));
    setSelectedReports([]);
  };

  return (
    <div className="space-y-4">
      {/* Barra de ferramentas superior */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search reports..."
            icon={<FiSearch />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Dropdown
            trigger={
              <Button variant="outline" icon={<FiFilter />}>
                {filter === 'all' ? 'All' : filter === 'pending' ? 'Pending' : 'Resolved'}
              </Button>
            }
            items={[
              { label: 'All Reports', onClick: () => setFilter('all') },
              { label: 'Pending Only', onClick: () => setFilter('pending') },
              { label: 'Resolved Only', onClick: () => setFilter('resolved') },
            ]}
          />
          
          <Dropdown
            trigger={
              <Button variant="outline">
                Sort: {sortOption === 'recent' ? 'Most Recent' : 'Priority'}
              </Button>
            }
            items={[
              { label: 'Most Recent', onClick: () => setSortOption('recent') },
              { label: 'Highest Priority', onClick: () => setSortOption('priority') },
            ]}
          />
        </div>
      </div>

      {/* Bulk actions toolbar */}
      {selectedReports.length > 0 && (
        <BulkActionsToolbar
          count={selectedReports.length}
          onResolve={handleBulkResolve}
          onCancel={() => setSelectedReports([])}
        />
      )}

      {/* Lista de reports */}
      {sortedReports.length > 0 ? (
        <div className="space-y-2">
          {sortedReports.map(report => (
            <ReportItem
              key={report.reportId}
              report={report}
              isSelected={selectedReports.some(r => r.reportId === report.reportId)}
              onSelect={() => setSelectedReport(report)}
              onToggleSelect={(isSelected) => {
                if (isSelected) {
                  setSelectedReports([...selectedReports, report]);
                } else {
                  setSelectedReports(selectedReports.filter(r => r.reportId !== report.reportId));
                }
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FiAlertCircle}
          title="No reports found"
          description={`No matching reports for "${searchQuery}"`}
        />
      )}

      {/* Modal de detalhes */}
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onResolve={(action) => {
            onResolveReport(selectedReport.reportId, action);
            setSelectedReport(null);
          }}
          onEscalate={(reason) => {
            onEscalateReport(selectedReport.reportId, reason);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
}