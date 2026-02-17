import { useState } from "react";
import { NavLink } from "react-router-dom";
import { doLogin } from "../http";
import { useDispatch } from "react-redux";
import {setAuth} from '../store/auth-slice';
import { toast } from "react-toastify";
import logo from "../assets/icons/logo.png";

const LoginForm = () =>
{  
    const dispatch = useDispatch();
    const [formData,setFormData] = useState({
        emailOrUsername:'',
        password:''
    });

    const [showPassword, setShowPassword] = useState(false);

    const inputEvent = (e) =>
    {
        const {name,value} = e.target;
        setFormData((old)=>
        {
            return {
                ...old,
                [name]:value
            }
        })
    }

    const onSubmit = async (e) =>
    {
        e.preventDefault();
        const {emailOrUsername,password} = formData;
        const identifier = (emailOrUsername || '').trim();
        if(!identifier || !password) return toast.error('Email/Username and Password are required');
        try {
            const res = await doLogin({ emailOrUsername: identifier, password });
            
            if(!res) {
                return toast.error('No response from server');
            }
            
            const {success, message, user} = res;
            
            if(success && user) {
                dispatch(setAuth(user));
                toast.success('Login Successful');
            } else {
                toast.error(message || 'Login failed');
            }
        } catch(error) {
            const serverMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message;
            toast.error(serverMessage || 'Login failed');
        }
    }

    return(
        <div id="app" style={{ minHeight: '100vh', background: 'var(--surface-bg)' }}>
        <section className="section py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                <div className="text-center mb-5 mt-4">
                  <img src={logo} alt="RACO EMS Logo" style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '12px' }} />
                  <h1 className="display-5 fw-bold gradient-text mb-2">RACO AI EMS</h1>
                  <p className="text-muted">Precision management for elite teams</p>
                </div>
    
                <div className="glass-card shadow-lg p-2 p-md-4">
                  <div className="card-body">
                    <div className="text-center mb-5">
                       <h4 className="fw-bold text-main">Secure Access</h4>
                       <span className="text-muted small">Enter your credentials to continue</span>
                    </div>
                    <form onSubmit={onSubmit} className="needs-validation" noValidate="">
                      <div className="form-group mb-4">
                        <label className="mb-2 small text-uppercase fw-bold text-muted letter-spacing-1" htmlFor="emailOrUsername">Email or Username</label>
                        <div className="input-group">
                            <span className="input-group-text border-0 bg-light rounded-start-3">
                                <i className="far fa-envelope text-primary"></i>
                            </span>
                            <input id="emailOrUsername" onChange={inputEvent} value={formData.emailOrUsername} type="text" className="form-control form-control-lg border-0 bg-light shadow-none rounded-end-3" name="emailOrUsername" placeholder="agent@target.com or username" tabIndex="1" required autoFocus/>
                        </div>
                      </div>
    
                      <div className="form-group mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="small text-uppercase fw-bold text-muted letter-spacing-1 m-0" htmlFor="password">Security Code</label>
                            <NavLink to='/forgot' className="text-primary small text-decoration-none fw-semibold">
                              Forgot?
                            </NavLink>
                        </div>
                        <div className="input-group">
                            <span className="input-group-text border-0 bg-light rounded-start-3">
                                <i className="fas fa-lock text-primary"></i>
                            </span>
                            <input id="password" onChange={inputEvent} value={formData.password} type={showPassword ? "text" : "password"} className="form-control form-control-lg border-0 bg-light shadow-none" name="password" placeholder="••••••••" tabIndex="2" required/>
                            <span className="input-group-text border-0 bg-light rounded-end-3" onClick={() => setShowPassword(!showPassword)} style={{cursor: 'pointer'}}>
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-primary`}></i>
                            </span>
                        </div>
                      </div>
    
    
                      <div className="form-group mt-5 mb-0">
                        <button type="submit" className="btn-primary w-100 py-3 shadow-lg border-0 text-uppercase letter-spacing-1 fw-bold" tabIndex="4">
                           Log In
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
            
              </div>
            </div>
          </div>
        </section>
      </div>
    )
}

export default LoginForm;
