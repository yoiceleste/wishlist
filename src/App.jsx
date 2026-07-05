import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BottomTab from './components/BottomTab';
import Home from './components/Home';
import WishList from './components/WishList';
import Inventory from './components/Inventory';
import InventoryEdit from './components/InventoryEdit';
import Budget from './components/Budget';
import NewWishStep1 from './components/NewWishStep1';
import NewWishStep2 from './components/NewWishStep2';
import NewWishStep3 from './components/NewWishStep3';
import NewWishStep4 from './components/NewWishStep4';
import PurchaseAdvice from './components/PurchaseAdvice';
import WishlistReview from './components/WishlistReview';

function App() {
  const location = useLocation();

  // 判断是否需要显示底部 Tab
  const hideTab = location.pathname.startsWith('/new') ||
    location.pathname.startsWith('/wishlist/review') ||
    location.pathname.startsWith('/inventory/edit') ||
    location.pathname.startsWith('/inventory/add');

  return (
    <div className="app-container">
      <div className={`page-content ${hideTab ? 'no-tab' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/wishlist/review/:id" element={<WishlistReview />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/add" element={<InventoryEdit />} />
          <Route path="/inventory/edit/:id" element={<InventoryEdit />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/new/step1" element={<NewWishStep1 />} />
          <Route path="/new/step2" element={<NewWishStep2 />} />
          <Route path="/new/step3" element={<NewWishStep3 />} />
          <Route path="/new/step4" element={<NewWishStep4 />} />
          <Route path="/new/result/:id?" element={<PurchaseAdvice />} />
        </Routes>
      </div>
      {!hideTab && <BottomTab />}
    </div>
  );
}

export default App;
