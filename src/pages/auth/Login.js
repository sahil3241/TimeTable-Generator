import React, {useState} from 'react'
import Layout from '../../components/Layouts/Layout.js';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {toast} from 'react-hot-toast';
import { useAuth } from '../../components/context/auth.js';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [auth, setAuth] = useAuth()

    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault()
        try{
            const res = await axios.post('/api/v1/auth/login',{email, password});
            if(res && res.data.success){
                toast.success('Login Successful');
                setAuth({
                    ...auth,
                    user: res.data.user,
                    token: res.data.token,
                })
                localStorage.setItem('auth', JSON.stringify(res.data));
                navigate(location.state ||'/');
            }
            else{
                toast.error(res.data.message);
            }
        }catch(error){
            console.log(error);
            toast.error('Something went wrong');
        }
    }

  return (
    <Layout title={'Login'}>
        <div className='form-container'>
            <h1>Login Page</h1>
            <form onSubmit={handleSubmit}>
                
                <div className="mb-3">
                    <input type="email" value={email} onChange={(e) => {
                        setEmail(e.target.value);
                    }} className="form-control" id="exampleInputEmail" placeholder='Enter your email' required/>
                </div>
                <div className="mb-3">
                    <input type="password" value={password} onChange={(e) => {
                        setPassword(e.target.value);
                    }} className="form-control" id="exampleInputPassword1" placeholder='Enter your password' required/>
                </div>
                <div className='mb-3'>
                <button type="submit" className="btn btn-primary" onClick={() => {navigate('/forgot-password')}}>Forgot Password</button>
                </div>
                
                <button type="submit" className="btn btn-primary">Login</button>
                </form>

            </div>
    </Layout>
  )
}

export default Login