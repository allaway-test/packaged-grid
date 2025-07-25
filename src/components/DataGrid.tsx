import React, { useState, useEffect, useCallback } from 'react'
import {
  DataSheetGrid,
  keyColumn,
  Column,
  createTextColumn,
} from 'react-datasheet-grid'
import 'react-datasheet-grid/dist/style.css'
import { DataGridRow, GridColumn, ExternalDataProvider } from '../types'
import throttle from 'lodash-es/throttle'

interface DataGridProps {
  dataProvider?: ExternalDataProvider
  initialData?: DataGridRow[]
  initialColumns?: GridColumn[]
  onDataChange?: (data: DataGridRow[]) => void
  enableAutoSave?: boolean
  autoSaveDelay?: number
}

const DataGrid: React.FC<DataGridProps> = ({
  dataProvider,
  initialData = [],
  initialColumns = [],
  onDataChange,
  enableAutoSave = true,
  autoSaveDelay = 500,
}) => {
  const [data, setData] = useState<DataGridRow[]>(initialData)
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert GridColumn to DataSheetGrid Column format
  const convertColumns = useCallback((gridColumns: GridColumn[]): Column[] => {
    return gridColumns.map(col => ({
      ...keyColumn(col.key, createTextColumn({ continuousUpdates: false })),
      title: col.title,
      disabled: col.editable === false,
      key: col.key, // Add key explicitly for our use
    }))
  }, [])

  // Initialize data and columns
  useEffect(() => {
    const initializeGrid = async () => {
      if (dataProvider) {
        setLoading(true)
        try {
          const [fetchedData, fetchedColumns] = await Promise.all([
            dataProvider.fetchData(),
            dataProvider.getColumns(),
          ])
          
          setData(fetchedData)
          setColumns(convertColumns(fetchedColumns))
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load data')
        } finally {
          setLoading(false)
        }
      } else {
        // Use provided initial data and columns
        setData(initialData)
        setColumns(convertColumns(initialColumns))
      }
    }

    initializeGrid()
  }, [dataProvider, initialData, initialColumns, convertColumns])

  // Auto-save functionality
  const autoSave = useCallback(
    throttle(async (newData: DataGridRow[]) => {
      if (dataProvider && enableAutoSave) {
        try {
          await dataProvider.updateData(newData)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to save data')
        }
      }
      
      if (onDataChange) {
        onDataChange(newData)
      }
    }, autoSaveDelay),
    [dataProvider, enableAutoSave, autoSaveDelay, onDataChange]
  )

  // Handle data changes
  const handleChange = (newData: DataGridRow[]) => {
    setData(newData)
    autoSave(newData)
  }

  // Manual save function
  const handleSave = async () => {
    if (dataProvider) {
      setLoading(true)
      try {
        await dataProvider.updateData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save data')
      } finally {
        setLoading(false)
      }
    }
  }

  // Add new row
  const addRow = () => {
    const newRow: DataGridRow = {}
    columns.forEach(col => {
      const colKey = (col as any).key as string
      if (colKey) {
        newRow[colKey] = ''
      }
    })
    
    // Add a unique ID for tracking
    newRow._id = Date.now().toString()
    
    const newData = [...data, newRow]
    setData(newData)
    autoSave(newData)
  }

  if (loading && data.length === 0) {
    return <div>Loading grid data...</div>
  }

  return (
    <div className="data-grid-container">
      <div className="data-grid-toolbar">
        <h3>Data Grid</h3>
        <div className="data-grid-actions">
          <button onClick={addRow} disabled={loading}>
            Add Row
          </button>
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
        <DataSheetGrid
          value={data}
          columns={columns}
          onChange={handleChange}
          rowKey="_id"
          createRow={() => ({
            _id: Date.now().toString(),
            ...columns.reduce((acc, col) => {
              const colKey = (col as any).key as string
              if (colKey) {
                acc[colKey] = ''
              }
              return acc
            }, {} as DataGridRow)
          })}
        />
      </div>
      
      <div className="data-grid-status">
        <p>Rows: {data.length} | Columns: {columns.length}</p>
        {enableAutoSave && <p>Auto-save enabled</p>}
      </div>
    </div>
  )
}

export default DataGrid