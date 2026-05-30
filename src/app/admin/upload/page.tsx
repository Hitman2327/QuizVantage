
import UploadForm from '@/components/upload-form';

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Upload New Quiz</h1>
      <p className="text-gray-600 mb-8">
        Create a quiz by providing a title, a description, and a JSON file containing the questions.
        The JSON file must be an array of question objects.
      </p>
      <UploadForm />
    </div>
  );
}
