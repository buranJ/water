import { useRoutes } from 'react-router';

import { routerConfig } from 'routes/routes';

function App() {
  const routes = useRoutes(routerConfig);
  return (
    <>
      <div>{routes}</div>
    </>
  );
}

export default App;
