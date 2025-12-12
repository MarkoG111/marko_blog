import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Authors from './pages/Authors'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Header from './components/Header'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import OnlyRolePrivateRoute from './components/OnlyRolePrivateRoute'
import CreatePost from './pages/CreatePost'
import UpdatePost from './pages/UpdatePost'
import PostPage from './pages/PostPage'
import UserPage from './pages/UserPage'
import ScrollToTop from './components/ScrollToTop'
import PostsPage from './pages/PostsPage'
import CategoryPage from './pages/CategoryPage'
import UserCommentPage from './pages/UserCommentPage'
import NotificationsPage from './pages/NotificationsPage'
import CreateCategory from './pages/CreateCategory'

import { ErrorProvider } from './contexts/ErrorContext'
import { SuccessProvider } from './contexts/SuccessContext'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { setNotifications } from './redux/notification/notificationsSlice'
import { addNotification } from './redux/notification/notificationsSlice';
import { NotificationsService } from './services/notificationsService'

export default function App() {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.user.currentUser);

    // REST: initial notifications load
    useEffect(() => {
        if (!currentUser) {
            return;
        }

        NotificationsService()
            .getNotifications()
            .then(data => {
                dispatch(setNotifications(data.items));
            })
            .catch(console.error);
    }, [currentUser, dispatch]);

    // REAL-TIME: SignalR bootstrap
    useEffect(() => {
        if (!currentUser) {
            return;
        }

        const token = localStorage.getItem("token");
        const service = NotificationsService();

        service.initSignalR({
            token,
            onReceive: (notification) => {
                dispatch(addNotification(notification));
            }
        });

        return () => {
            service.cleanupSignalR();
        };
    }, [currentUser, dispatch]);

    return (
        <BrowserRouter>
            <ErrorProvider>
                <SuccessProvider>
                    <ScrollToTop />
                    <Header />
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/authors' element={<Authors />} />
                        <Route path='/posts' element={<PostsPage />} />
                        <Route path='/sign-in' element={<SignIn />} />
                        <Route path='/sign-up' element={<SignUp />} />
                        <Route element={<PrivateRoute />}>
                            <Route path='/dashboard' element={<Dashboard />} />
                        </Route>
                        <Route element={<OnlyRolePrivateRoute />}>
                            <Route path='/create-post' element={<CreatePost />} />
                            <Route path='/create-category' element={<CreateCategory />} />
                            <Route path='/update-post/:postId' element={<UpdatePost />} />
                        </Route>

                        <Route path='/notifications' element={<NotificationsPage />} />

                        <Route path='/post/:id' element={<PostPage />} />
                        <Route path='/user/:id' element={<UserPage />} />
                        <Route path='/category/:id' element={<CategoryPage />} />
                        <Route path='/comment/:id' element={<UserCommentPage />} />
                    </Routes>
                    <Footer />
                </SuccessProvider>
            </ErrorProvider>
        </BrowserRouter>
    )
}
