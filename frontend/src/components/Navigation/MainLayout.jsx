import SideBar from '../sidebar.jsx';
import Navigation from '../navigation.jsx';
import { ThemeProvider } from '../../store/ThemeContext.js';

const MainLayout = ({ children }) => {
  return (
    <ThemeProvider>
      <div id="app">
        <div className="main-wrapper">
          <Navigation />
          <SideBar />
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;
