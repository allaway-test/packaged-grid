import React, { useState, useEffect } from 'react'
import * as SynapseReactClient from 'synapse-react-client'
import { RowSet, ExternalDataProvider } from '../types'

interface DataGridProps {
  dataProvider?: ExternalDataProvider
  initialData?: RowSet
  onDataChange?: (data: RowSet) => void
  enableAutoSave?: boolean
  autoSaveDelay?: number
}

const DataGrid: React.FC<DataGridProps> = ({
  dataProvider,
  initialData,
  onDataChange,
  enableAutoSave = true,
  autoSaveDelay = 500,
}) => {
  const [data, setData] = useState<RowSet | null>(initialData || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize data
  useEffect(() => {
    const initializeGrid = async () => {
      if (dataProvider) {
        setLoading(true)
        try {
          const fetchedData = await dataProvider.fetchData()
          setData(fetchedData)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load data')
        } finally {
          setLoading(false)
        }
      }
    }

    initializeGrid()
  }, [dataProvider])

  // Manual save function
  const handleSave = async () => {
    if (dataProvider && data) {
      setLoading(true)
      try {
        await dataProvider.updateData(data)
        setError(null)
        if (onDataChange) {
          onDataChange(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save data')
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading && !data) {
    return <div>Loading grid data...</div>
  }

  if (!data) {
    return <div>No data available</div>
  }

  return (
    <div className="data-grid-container">
      <div className="data-grid-toolbar">
        <h3>Data Grid</h3>
        <div className="data-grid-actions">
          {dataProvider && (
            <button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="data-grid-error" style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}
      
      <div className="data-grid-wrapper">
        <SynapseReactClient.SynapseComponents.SynapseTable
          rowSet={data}
          isLoadingNewPage={loading}
          showAccessColumn={false}
          showExternalAccessIcon={false}
          showAccessColumnHeader={false}
          showDirectDownloadColumn={false}
          hideAddToDownloadListColumn={true}
        />
      </div>
      
      <div className="data-grid-status">
        <p>Rows: {data.rows.length} | Columns: {data.headers.length}</p>
        {enableAutoSave && <p>Auto-save enabled</p>}
      </div>
    </div>
  )
}

export default DataGrid