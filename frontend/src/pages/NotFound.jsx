import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container mt-5 text-center">
            <div className="jumbotron">
                <h1 className="display-4 text-danger">404</h1>
                <p className="lead">Page Not Found</p>
                <hr className="my-4" />
                <p>The page you are looking for does not exist or has been moved.</p>
                <Link className="btn btn-primary btn-lg" to="/" role="button">Go Home</Link>
            </div>
        </div>
    );
};

export default NotFound;
