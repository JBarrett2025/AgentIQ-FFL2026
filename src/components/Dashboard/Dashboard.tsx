import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../services/firebase';
import PromptModal from '../PromptModal';

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [promptState, setPromptState] = useState<{ isOpen: boolean; title: string; label: string; onConfirm: (v: string) => void } | null>(null);
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProjects = async () => {
            try {
                // Fetch projects owned by this user
                const qOwned = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
                const qShared = query(collection(db, 'projects'), where('collaboratorEmails', 'array-contains', user.email?.toLowerCase().trim() || ''));
                
                const [ownedSnap, sharedSnap] = await Promise.all([getDocs(qOwned), getDocs(qShared)]);
                
                const userProjects = [...ownedSnap.docs, ...sharedSnap.docs].map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Deduplicate
                const uniqueProjects = Array.from(new Map(userProjects.map(p => [p.id, p])).values());
                
                setProjects(uniqueProjects);
            } catch (err) {
                console.error("Error fetching projects", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user, navigate]);

    const handleCreateCloudProject = () => {
        if (!user) return;
        setPromptState({
            isOpen: true,
            title: 'Create Cloud Project',
            label: 'Project Name:',
            onConfirm: async (projectName) => {
                if (!projectName || projectName.trim() === '') return;
                try {
                    const docRef = await addDoc(collection(db, 'projects'), {
                        projectName: projectName.trim(),
                        ownerId: user.uid,
                        ownerEmail: user.email?.toLowerCase().trim() || 'Unknown',
                        collaboratorIds: [],
                        collaboratorEmails: [],
                        siteData: null, // Will be seeded later when opened in editor
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                    navigate(`/editor/cloud/${docRef.id}`);
                    setPromptState(null);
                } catch (err) {
                    console.error("Error creating project", err);
                    alert("Failed to create cloud project.");
                }
            }
        });
    };

    const handleShareProject = (projectId: string) => {
        setPromptState({
            isOpen: true,
            title: 'Share Project',
            label: 'Collaborator Email Address:',
            onConfirm: async (email) => {
                if (!email) return;
                try {
                    const docRef = doc(db, 'projects', projectId);
                    await updateDoc(docRef, {
                        collaboratorEmails: arrayUnion(email.toLowerCase().trim())
                    });
                    
                    // Update local state instantly so the dropdown updates without a reload
                    setProjects(prev => prev.map(p => 
                        p.id === projectId 
                            ? { ...p, collaboratorEmails: [...(p.collaboratorEmails || []), email.toLowerCase().trim()] }
                            : p
                    ));

                    alert(`Successfully shared with ${email}!`);
                    setPromptState(null);
                } catch (e) {
                    console.error("Error sharing project", e);
                    alert("Failed to share project.");
                }
            }
        });
    };

    const handleRemoveCollaborator = async (projectId: string, email: string) => {
        if (window.confirm(`Are you sure you want to remove ${email} from this project?`)) {
            try {
                const docRef = doc(db, 'projects', projectId);
                await updateDoc(docRef, {
                    collaboratorEmails: arrayRemove(email)
                });
                setProjects(prev => prev.map(p => 
                    p.id === projectId 
                        ? { ...p, collaboratorEmails: p.collaboratorEmails.filter((e: string) => e !== email) }
                        : p
                ));
            } catch (err) {
                console.error("Error removing collaborator", err);
                alert("Failed to remove collaborator.");
            }
        }
    };

    const handleArchiveProject = async (projectId: string, isArchived: boolean) => {
        try {
            const docRef = doc(db, 'projects', projectId);
            await updateDoc(docRef, { isArchived });
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isArchived } : p));
        } catch (err) {
            console.error("Error updating archive status", err);
            alert("Failed to update project status.");
        }
    };

    const visibleProjects = projects.filter(p => !!p.isArchived === showArchived);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-800">Your Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-slate-600">Logged in as {user?.email}</span>
                    <button 
                        onClick={() => signOut()}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Local Project Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        Local Offline Project
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Continue working on your current project saved directly to this browser. Changes here do not sync to the cloud. Perfect for private exploration or if you don't need real-time collaboration.
                    </p>
                    <button 
                        onClick={() => navigate('/editor/local')} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded transition-colors"
                    >
                        Open Local Project
                    </button>
                </div>

                {/* Cloud Projects Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                        Cloud Projects
                    </h2>
                    
                    {loading ? (
                        <p className="text-slate-500 py-4">Loading your projects...</p>
                    ) : visibleProjects.length === 0 ? (
                        <div className="bg-slate-50 p-4 rounded text-center text-slate-500 mb-6">
                            {showArchived ? "You don't have any archived projects." : "You don't have any active cloud projects yet."}
                        </div>
                    ) : (
                        <ul className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                            {visibleProjects.map(p => (
                                <li key={p.id} className="border border-slate-200 bg-white rounded hover:border-blue-400 transition-colors flex justify-between items-center group overflow-hidden">
                                    <button 
                                        onClick={() => navigate(`/editor/cloud/${p.id}`)}
                                        className="text-left px-4 py-3 flex-grow flex items-center min-w-0"
                                    >
                                        <span className="font-medium text-slate-700 truncate">{p.projectName}</span>
                                        <span className="text-sm text-slate-400 ml-2 whitespace-nowrap flex-shrink-0">
                                            {p.ownerId === user?.uid 
                                                ? 'Created by You' 
                                                : `Shared by ${p.ownerEmail || 'Unknown Owner'}`}
                                        </span>
                                    </button>
                                    <div className="flex items-stretch">
                                        {p.ownerId === user?.uid && p.collaboratorEmails && p.collaboratorEmails.length > 0 && (
                                            <select 
                                                className="text-xs bg-white border border-slate-200 text-slate-600 rounded px-2 py-1 mr-3 outline-none max-w-[150px] shadow-sm cursor-pointer"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val !== 'title') {
                                                        e.target.value = 'title'; // reset visually
                                                        handleRemoveCollaborator(p.id, val);
                                                    }
                                                }}
                                                defaultValue="title"
                                                title="Select an email to remove them from project"
                                            >
                                                <option value="title" disabled>Shared ({p.collaboratorEmails.length})</option>
                                                {Array.from(new Set(p.collaboratorEmails)).map((email: any) => (
                                                    <option key={email} value={email}>Remove: {email}</option>
                                                ))}
                                            </select>
                                        )}
                                        {p.ownerId === user?.uid && (
                                            <>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleArchiveProject(p.id, !p.isArchived); }}
                                                    className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm font-medium border-l border-slate-100 h-full flex items-center"
                                                >
                                                    {p.isArchived ? 'Restore' : 'Archive'}
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleShareProject(p.id); }}
                                                    className="px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium border-l border-slate-100 h-full flex items-center"
                                                >
                                                    Share
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <button 
                        onClick={handleCreateCloudProject}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors flex justify-center items-center gap-2 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Create New Cloud Project
                    </button>

                    <div className="text-center">
                        <button 
                            onClick={() => setShowArchived(!showArchived)}
                            className="text-sm text-slate-400 hover:text-slate-600 hover:underline transition-colors cursor-pointer"
                        >
                            {showArchived ? 'View Active Projects' : 'View Archived Projects'}
                        </button>
                    </div>
                </div>
            </div>

            {promptState?.isOpen && (
                <PromptModal
                    isOpen={promptState.isOpen}
                    title={promptState.title}
                    label={promptState.label}
                    onConfirm={promptState.onConfirm}
                    onCancel={() => setPromptState(null)}
                />
            )}
        </div>
    );
}
