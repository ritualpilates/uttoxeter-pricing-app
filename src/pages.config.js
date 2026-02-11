/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminSettings from './pages/AdminSettings';
import QuoteBuilder from './pages/QuoteBuilder';
import Quotes from './pages/Quotes';
import QuoteStart from './pages/QuoteStart';
import QuoteDepartments from './pages/QuoteDepartments';
import QuoteGarments from './pages/QuoteGarments';
import QuoteHygiene from './pages/QuoteHygiene';
import QuoteReview from './pages/QuoteReview';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminSettings": AdminSettings,
    "QuoteBuilder": QuoteBuilder,
    "Quotes": Quotes,
    "QuoteStart": QuoteStart,
    "QuoteDepartments": QuoteDepartments,
    "QuoteGarments": QuoteGarments,
    "QuoteHygiene": QuoteHygiene,
    "QuoteReview": QuoteReview,
}

export const pagesConfig = {
    mainPage: "AdminSettings",
    Pages: PAGES,
    Layout: __Layout,
};