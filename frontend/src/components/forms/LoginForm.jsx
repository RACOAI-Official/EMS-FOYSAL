import { useState } from "react";
import { NavLink } from "react-router-dom";
import { doLogin } from "../../http";
import { useDispatch } from "react-redux";
import {setAuth} from '../../store/auth-slice';
import { toast } from "react-toastify";

const LoginForm = () =>
{  
    const dispatch = useDispatch();
    const [formData,setFormData] = useState({
        email:'',
        password:''
    });

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
        const {email,password} = formData;
        if(!email || !password) return toast.error('All Fields Required');
        try {
            console.log('Login attempt with:', {email});
            const res = await doLogin({email,password});
            console.log('Login response:', res);
            
            if(!res) {
                console.error('No response from server');
                return toast.error('No response from server');
            }
            
            const {success, message, user} = res;
            console.log('Response values:', {success, message, user});
            
            if(success && user) {
                console.log('Login successful, dispatching auth');
                dispatch(setAuth(user));
                toast.success('Login Successful');
            } else {
                console.error('Login failed:', message);
                toast.error(message || 'Login failed');
            }
        } catch(error) {
            console.error('Login error:', error);
            toast.error('Login error: ' + (error.message || 'Unknown error'));
        }
    }

    return(
        <div id="app" style={{ minHeight: '100vh', background: 'var(--surface-bg)' }}>
        <section className="section py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                <div className="text-center mb-5 mt-4">
                  <h1 className="display-5 fw-bold gradient-text mb-2">Target Pro</h1>
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
                        <label className="mb-2 small text-uppercase fw-bold text-muted letter-spacing-1" htmlFor="email">Email Address</label>
                        <div className="input-group">
                            <span className="input-group-text border-0 bg-light rounded-start-3">
                                <i className="far fa-envelope text-primary"></i>
                            </span>
                            <input id="email" onChange={inputEvent} value={formData.email} type="email" className="form-control form-control-lg border-0 bg-light shadow-none rounded-end-3" name="email" placeholder="agent@target.com" tabIndex="1" required autoFocus/>
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
                            <input id="password" onChange={inputEvent} value={formData.password} type="password" className="form-control form-control-lg border-0 bg-light shadow-none rounded-end-3" name="password" placeholder="••••••••" tabIndex="2" required/>
                        </div>
                      </div>
    
    
                      <div className="form-group mt-5 mb-0">
                        <button type="submit" className="gradient-btn w-100 py-3 shadow-lg border-0 text-uppercase letter-spacing-1 fw-bold" tabIndex="4">
                          Authorize Access
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="text-center mt-5 text-muted small">
                  Crafted for excellence by <a href="https://github.com/deepak-singh5219" target="_blank" className="text-primary text-decoration-none fw-semibold">Deepak Singh</a>
                  <div className="mt-3 fs-5 d-flex justify-content-center gap-3">
                    <a className="text-muted opacity-50 hover-opacity-100 transition-all" target="_blank" href="https://github.com/deepak-singh5219">
                        <i className="fab fa-github"></i>
                    </a>
                    <a className="text-muted opacity-50 hover-opacity-100 transition-all" href="https://www.linkedin.com/in/deepaksingh5219/" target="_blank">
                        <i className="fab fa-linkedin"></i>
                    </a>
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
