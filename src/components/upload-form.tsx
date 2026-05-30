'use client';

import { useState, useRef } from 'react';
import { saveQuizFromJSONAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !file) {
      setError('Title, description, and a JSON file are required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = async (evt) => {
        if (evt.target?.result) {
          try {
            const jsonContent = evt.target.result as string;
            const result = await saveQuizFromJSONAction(title, description, jsonContent);
            if (result.success) {
              router.push(`/quiz/${result.quizId}`); // Redirect to the new quiz page
            } else {
              setError('Failed to save the quiz. Please check the JSON format.');
            }
          } catch (err: any) {
            setError(err.message || 'An error occurred while processing the file.');
          }
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Error reading the file.');
        setIsLoading(false);
      };
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Quiz Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Quiz Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          required
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Quiz Questions (JSON File)</label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".json"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Select File
          </button>
          {file && <span className="ml-4 text-gray-500">{file.name}</span>}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Uploading...' : 'Upload Quiz'}
        </button>
      </div>
    </form>
  );
}
