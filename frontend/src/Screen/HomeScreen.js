import React, { useLayoutEffect } from 'react';
import { api } from '../API/API';
import { useAuth } from '../Context/authContext';

export default function HomeScreen() {

    const { currentUser } = useAuth();

    const setIdForUser = async () => {
        const token = await currentUser?.getIdToken();
        const response = await api.get(`/user/byEmail/${currentUser?.email}`, { 'headers': { 'Authorization': `Bearer ${token}` } });
        window.localStorage.setItem("userId", response.data._id);
    }

    useLayoutEffect(() => {
        setIdForUser();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <lottie-player src="https://assets10.lottiefiles.com/private_files/lf30_jfozfthz.json" background="rgba(1,1,1,1)" speed="0.8" style={{ width: "100%", height: "100vh" }} autoplay loop></lottie-player>
    );
}
