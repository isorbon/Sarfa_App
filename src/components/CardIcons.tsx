import React from 'react';

export const VisaIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
    <svg
        width={size}
        height={size * 0.32}
        viewBox="0 0 100 32"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ maxWidth: '100%', height: 'auto' }}
    >
        <path d="M36.793 2L26.75 25.688H20.375L28.937 2.008L36.793 2ZM65.867 2.273C65.512 2.133 64.27 1.766 62.723 1.766C58.828 1.766 56.121 3.824 56.094 6.789C56.066 8.941 58.07 10.152 59.578 10.887C61.125 11.641 61.649 12.113 61.649 13.117C61.649 14.477 60.035 15.086 58.52 15.086C55.859 15.086 54.34 14.711 53.125 14.16L52.516 13.883L51.328 19.344C53.305 20.246 56.938 20.672 59.191 20.707C65.375 20.707 69.418 17.688 69.445 12.918C69.461 9.941 67.727 8.441 63.992 6.648C62.336 5.8 61.691 5.316 61.691 4.383C61.691 3.398 62.793 2.945 64.129 2.945C65.176 2.898 67.617 3.203 69.832 4.223L71.258 1.48C69.605 0.902 67.898 0.449 65.867 2.273ZM88.07 20.473H94.133L88.758 7.371C88.168 5.766 87.621 5.094 86.41 5.094H81.879L80.992 0.887H69.965C68.977 0.887 68.227 1.555 67.863 2.453L58.023 25.688H65.867L67.438 21.32H77.676L78.613 25.688H86.207L88.07 20.473ZM69.574 16.359L73.199 6.699L75.309 16.359H69.574ZM15.82 2.008H9.727C8.75 2.008 7.895 2.582 7.527 3.559L0.0900002 20.738L0.0350002 20.973H7.641L9.156 16.711H19.789L21.578 25.688H28.469L18.664 2.008H15.82Z" />
    </svg>
);

export const MastercardIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
    <svg
        width={size}
        height={size * 0.77} // aspect ratio roughly 1.3:1
        viewBox="0 0 38 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ maxWidth: '100%', height: 'auto' }}
    >
        <circle cx="12" cy="15" r="12" fill="#EB001B" />
        <circle cx="26" cy="15" r="12" fill="#F79E1B" fillOpacity="0.85" />
    </svg>
);

export const AmexIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
    <svg
        width={size}
        height={size * 0.65}
        viewBox="0 0 50 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ maxWidth: '100%', height: 'auto' }}
    >
        <rect width="50" height="32" rx="4" fill="#00579F" />
        <path d="M14.5 19H12L10.5 15L9 19H6L8 13.5L5.5 8H9L10.5 12L12 8H15L12.5 13.5L14.5 19Z" fill="white" />
        <path d="M22.5 19H20V12H18.5V11H23.5V12H22V19Z" fill="white" />
        <path d="M31.5 19H29V17H26.5V19H25V8H31V9.5H26.5V12H29V13.5H26.5V15.5H31.5V19Z" fill="white" />
        <path d="M39.5 19H37L35.5 16L34 19H31.5L34 13.5L31.5 8H34L35.5 11L37 8H39.5L37 13.5L39.5 19Z" fill="white" />
    </svg>
);
