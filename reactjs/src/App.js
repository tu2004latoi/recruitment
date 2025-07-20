import { useEffect, useReducer } from 'react';
import './App.css';
import MyUserReducer from './components/reducers/MyUserReducer';
import { authApis, endpoints } from './configs/Apis';
import Cookies from 'js-cookie';
import { MyDispatcherContext, MyUserContext } from './configs/MyContexts';
import { BrowserRouter, Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';
import { Container } from 'react-bootstrap';

function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  useEffect(() => {
    const loadUser = async () => {
      const token = Cookies.get("token");
      if (token !== undefined) {
        try {
          let res = await authApis().get(endpoints["current-user"]);
          dispatch({
            type: "login",
            payload: res.data,
          });
        } catch (err) {
          console.error("Lỗi load user từ token:", err);
          Cookies.remove("token");
        }
      }
    };

    loadUser();
  }, []);
  
  return (
     <MyUserContext.Provider value={user}>
      <MyDispatcherContext.Provider value={dispatch}>
        <BrowserRouter>
          <Container>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </MyDispatcherContext.Provider>
    </MyUserContext.Provider>
  );
}

export default App;
