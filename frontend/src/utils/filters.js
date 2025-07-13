export async function fetchFilters() {
  const [chapters, topics, types] = await Promise.all([
    fetch('http://localhost:8000/api/chapters/').then(r => r.json()),
    fetch('http://localhost:8000/api/topics/').then(r => r.json()),
    fetch('http://localhost:8000/api/questiontypes/').then(r => r.json()),
  ]);
  return {
    chapters,
    topics,
    types,
    levels: [
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'Medium' },
      { value: 'hard', label: 'Hard' },
    ],
  };
}
