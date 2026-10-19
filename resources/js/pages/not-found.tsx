import React from 'react';
import ErrorPage from './error';

export default function NotFound() {
    return <ErrorPage status={404} />;
}
