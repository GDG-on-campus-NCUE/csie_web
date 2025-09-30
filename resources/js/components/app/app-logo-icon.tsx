import logo from '@/assets/logo.png';
import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src={logo}
            alt="Logo"
            className={`object-contain ${props.className || ''}`}
        />
    );
}
