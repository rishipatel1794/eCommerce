import React from 'react'
import { X } from 'lucide-react'

const DeleteConfirmation = ({ isOpen, onClose, onConfirm, itemName, isDeleting }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Delete Confirmation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete <span className="font-medium">{itemName || 'this item'}</span>? This action cannot be undone.
          </p>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmation