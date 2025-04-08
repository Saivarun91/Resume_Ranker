import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ResumeRanker() {
  const [resume, setResume] = useState(null);
  const [job, setJob] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    setResume(file);
  };

  const handleJobChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    setJob(file);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('job', job);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const data = await response.json();
      setResult({
        score: data.score || 0,
        matched_skills: data.matched_skills || [],
        missing_skills: data.missing_skills || [],
        suggestions: data.suggestions || [],
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('An error occurred while uploading files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">Resume Ranker</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <label htmlFor="resume-upload" className="block mb-1 font-medium">
              Upload Resume (PDF)
            </label>
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf"
              onChange={handleResumeChange}
            />
          </div>
          <div>
            <label htmlFor="job-upload" className="block mb-1 font-medium">
              Upload Job Description (PDF)
            </label>
            <Input
              id="job-upload"
              type="file"
              accept=".pdf"
              onChange={handleJobChange}
            />
          </div>
          <Button onClick={handleUpload} disabled={!resume || !job || loading}>
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="text-xl font-semibold">Match Score: {result.score} / 100</h2>
            <div>
              <h3 className="font-semibold">Matched Skills:</h3>
              <p>{result.matched_skills.join(', ') || 'None'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Missing Skills:</h3>
              <p>{result.missing_skills.join(', ') || 'None'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Suggestions:</h3>
              <ul className="list-disc list-inside">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
