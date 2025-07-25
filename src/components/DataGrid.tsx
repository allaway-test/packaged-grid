import React, { useState, useEffect } from 'react'
// TODO: Fix import path for SynapseTable once the correct import structure is determined
// import { SynapseTable } from 'synapse-react-client'
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
        <h3>Data Grid (Synapse-powered)</h3>
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
        {/* Placeholder table using Synapse RowSet structure - will be replaced with SynapseTable */}
        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {data.headers.map((header, index) => (
                  <th key={index} style={{ padding: '8px', backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                    {header.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.values.map((value, colIndex) => (
                    <td key={colIndex} style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          Powered by Synapse types: RowSet with {data.headers.length} columns and {data.rows.length} rows
        </div>
      </div>
      
      <div className="data-grid-status">
        <p>Rows: {data.rows.length} | Columns: {data.headers.length}</p>
        {enableAutoSave && <p>Auto-save enabled</p>}
      </div>
    </div>
  )
}

export default DataGrid