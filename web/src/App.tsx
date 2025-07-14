import { useState, useEffect } from "react";

function App() {
  const [apiStatus, setApiStatus] = useState<string>("Loading...");

  useEffect(() => {
    fetch("/api/overlay")
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(() => setApiStatus("API connection failed"));
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <h1 className="text-2xl font-bold">Stream Custom Overlay</h1>
      <p>API Status: {apiStatus}</p>

      <span className="font-bold">Teste</span>

    </div>
  );
}

export default App;
