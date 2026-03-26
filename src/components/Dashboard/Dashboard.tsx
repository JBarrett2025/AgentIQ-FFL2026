import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProjects = async () => {
            try {
                // Fetch projects owned by this user
                const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                
                const userProjects = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setProjects(userProjects);
            } catch (err) {
                console.error("Error fetching projects", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user, navigate]);

    const handleCreateCloudProject = async () => {
        if (!user) return;
        try {
            const docRef = await addDoc(collection(db, 'projects'), {
                projectName: 'New Cloud Project',
                ownerId: user.uid,
                collaboratorIds: [],
                siteData: null, // Will be seeded later when opened in editor
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            navigate(`/editor/cloud/${docRef.id}`);
        } catch (err) {
            console.error("Error creating project", err);
            alert("Failed to create cloud project.");
        }
    };

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
                        onClick={() => navigate('/')} 
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
                    ) : projects.length === 0 ? (
                        <div className="bg-slate-50 p-4 rounded text-center text-slate-500 mb-6">
                            You don't have any cloud projects yet.
                        </div>
                    ) : (
                        <ul className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                            {projects.map(p => (
                                <li key={p.id} className="border border-slate-200 rounded hover:border-blue-400 transition-colors">
                                    <button 
                                        onClick={() => navigate(`/editor/cloud/${p.id}`)}
                                        className="w-full text-left px-4 py-3 flex justify-between items-center"
                                    >
                                        <span className="font-medium text-slate-700">{p.projectName}</span>
                                        <span className="text-sm text-slate-400">Owner</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <button 
                        onClick={handleCreateCloudProject}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors flex justify-center items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Create New Cloud Project
                    </button>
                </div>
            </div>
        </div>
    );
}
