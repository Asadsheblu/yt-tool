/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useRef, useState } from 'react';
import { FaCopy, FaDownload, FaFacebook, FaInstagram, FaLinkedin, FaSearch, FaShareAlt, FaTimes, FaTwitter } from 'react-icons/fa';
import { FaGrip } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import sanitizeHtml from 'sanitize-html';

const TagExtractor = () => {
    const { isLoggedIn } = useAuth();
    const [videoUrl, setVideoUrl] = useState('');
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showShareIcons, setShowShareIcons] = useState(false);
    const [generateCount, setGenerateCount] = useState(0);
    const [content, setContent] = useState('');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`/api/content?category=tagExtractor`);
                if (!response.ok) {
                    throw new Error('Failed to fetch content');
                }
                const data = await response.json();
                if (data && data.length > 0 && data[0].content) {
                    const sanitizedContent = sanitizeHtml(data[0].content, {
                        allowedTags: ['h2', 'h3', 'p', 'li', 'a'],
                        allowedAttributes: {
                            'a': ['href']
                        }
                    });
                    setContent(sanitizedContent);
                } else {
                    toast.error("Content data is invalid");
                }
            } catch (error) {
                toast.error("Error fetching content");
            }
        };

        fetchContent();
    }, []);

    const handleUrlChange = (e) => {
        setVideoUrl(e.target.value);
    };

    const copyAllTagsToClipboard = () => {
        const textToCopy = tags.join(', ');
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast.success('Tags copied to clipboard!');
        }, (err) => {
            toast.error('Failed to copy tags:', err);
        });
    };

    const fetchTags = async () => {
        if (!videoUrl) {
            setError('Please enter a valid YouTube URL');
            toast.error('Please enter a valid YouTube URL');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/fetch-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoUrl }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch tags');
            }
            const data = await response.json();
            setTags(data.tags || []);
        } catch (err) {
            setError(err.message);
            setTags([]);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (tag) => {
        navigator.clipboard.writeText(tag).then(() => {
            toast.success(`Copied: "${tag}"`);
        }, (err) => {
            toast.error('Failed to copy text:', err);
        });
    };

    const downloadTags = () => {
        const element = document.createElement("a");
        const file = new Blob([tags.join('\n')], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "YouTubeTags.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const shareOnSocialMedia = (socialNetwork) => {
        const url = encodeURIComponent(window.location.href);
        const socialMediaUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}`,
            instagram: "You can share this page on Instagram through the Instagram app on your mobile device.",
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        };

        if (socialNetwork === 'instagram') {
            alert(socialMediaUrls[socialNetwork]);
        } else {
            window.open(socialMediaUrls[socialNetwork], "_blank");
        }
    };

    const handleShareClick = () => {
        setShowShareIcons(!showShareIcons);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
            <h2 className='text-3xl pt-5'>YouTube Tag Extractor</h2>
            <div className="bg-yellow-100 border-t-4 border-yellow-500 rounded-b text-yellow-700 px-4 py-3 shadow-md mb-6 mt-3" role="alert">
                <ToastContainer/>
                <div className="flex">
                    <div className="py-1">
                        <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"></svg>
                    </div>
                    <div>
                        {isLoggedIn ? (
                            <p className="text-center p-3 alert-warning">
                                You are logged in and can generate unlimited tags.
                            </p>
                        ) : (
                            <p className="text-center p-3 alert-warning">
                                You are not logged in. You can generate tags {5 - generateCount}{" "}
                                more times. <Link href="/register" className="btn btn-warning ms-3">Register</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="row justify-content-center pt-5">
                <div className="col-md-6">
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter YouTube Video URL..."
                            aria-label="YouTube Video URL"
                            aria-describedby="button-addon2"
                            value={videoUrl}
                            onChange={handleUrlChange}
                        />
                        <button
                            className="btn btn-danger"
                            type="button"
                            id="button-addon2"
                            onClick={fetchTags}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Generate Tags'}
                        </button>
                    </div>
                    <small className="text-muted">
                        Example: https://youtu.be/eUDKzw0gLg
                    </small>
                    <br/>
                    <div className='ms-5'>
                        <button className="btn btn-danger mt-3" onClick={handleShareClick}>
                            <FaShareAlt />
                        </button>
                        {showShareIcons && (
                            <div className="share-icons mt-3">
                                <FaFacebook className="facebook-icon" onClick={() => shareOnSocialMedia('facebook')} />
                                <FaInstagram className="instagram-icon" onClick={() => shareOnSocialMedia('instagram')} />
                                <FaTwitter className="twitter-icon" onClick={() => shareOnSocialMedia('twitter')} />
                                <FaLinkedin className="linkedin-icon" onClick={() => shareOnSocialMedia('linkedin')} />
                            </div>
                        )}
                    </div>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {tags.length > 0 && (
                        <div>
                            <h3>Tags:</h3>
                            <div className="d-flex flex-wrap">
                                {tags.map((tag, index) => (
                                    <div key={index} className="bg-light m-1 p-2 rounded-pill d-flex align-items-center extract">
                                        <FaGrip className='text-muted'/>    
                                        <span onClick={() => copyToClipboard(tag)} style={{ cursor: 'pointer' }}>{tag}</span> 
                                        <FaTimes className="ms-2 text-danger" onClick={() => removeTag(index)} />
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-danger mt-3" onClick={downloadTags}>
                                Download <FaDownload />
                            </button>
                            <button className="btn btn-danger mt-3 ms-2" onClick={copyAllTagsToClipboard}>
                                Copy <FaCopy />
                            </button>
                        </div>
                    )}
                </div>
                <div className="content pt-6 pb-5">
                    <div dangerouslySetInnerHTML={{ __html: content }}></div>
                </div>
            </div>

        </div>
    );
};

export default TagExtractor;
