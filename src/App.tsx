import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";
import VisitLogger from "./components/VisitLogger";

const App = () => {
  return (
    <>
      <LoadingProvider>
        <VisitLogger />
        <Suspense fallback={<div>Loading app...</div>}>
          <MainContainer>
            <Suspense fallback={null}>
              <CharacterModel />
            </Suspense>
          </MainContainer>
        </Suspense>
        <Analytics />
      </LoadingProvider>
    </>
  );
};

export default App;
