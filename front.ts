import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function ResumeRanker() {
  const [resume, setResume] = useState(null);
  const [job, setJob] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!resume || !job) return;

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('job', job);

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server error. Please try again.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Resume Ranker</h1>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <label className="block mb-1 font-medium">Upload Resume (PDF)</label>
            <Input type="file" accept=".pdf" onChange={(e) => setResume(e.target.files[0])} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Upload Job Description (PDF)</label>
            <Input type="file" accept=".pdf" onChange={(e) => setJob(e.target.files[0])} />
          </div>
          <Button onClick={handleUpload} disabled={!resume || !job || loading}>
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2" /> Analyzing...
              </span>
            ) : (
              'Analyze Resume'
            )}
          </Button>
          {error && <p className="text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="text-xl font-semibold text-green-700">Match Score: {result.score} / 100</h2>
            <div>
              <h3 className="font-semibold">✅ Matched Skills:</h3>
              <p>{result.matched_skills.length ? result.matched_skills.join(', ') : 'None'}</p>
            </div>
            <div>
              <h3 className="font-semibold">⚠️ Missing Skills:</h3>
              <p>{result.missing_skills.length ? result.missing_skills.join(', ') : 'None'}</p>
            </div>
            <div>
              <h3 className="font-semibold">💡 Suggestions:</h3>
              <ul className="list-disc list-inside">
                {result.suggestions.length ? (
                  result.suggestions.map((s, i) => <li key={i}>{s}</li>)
                ) : (
                  <li>No suggestions</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
