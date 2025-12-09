import { useLeaderboard } from '../hooks/useLeaderboard';
import { FaStar } from 'react-icons/fa';
import { useUserChallenge, type Challenge } from '../hooks/useChallenge';
import { useEffect, useState } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Modal
} from 'flowbite-react';
import { useAuth } from '@/hooks/useAuth';
import { type LeaderboardRow } from '@/hooks/useLeaderboard';
import QuizChallenge from './Quiz';

export default function Leaderboards() {
  const { leaderboardRows, isLoadingRows, rowsError, refetch: refetchLeaderboard } = useLeaderboard();
  const { user } = useAuth();
  const { challenges, isLoading: isLoadingChallenges, refetch: refetchChallenges } = useUserChallenge();
  const userName = user?.username || 'Guest';
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const [starChanges, setStarChanges] = useState<{ [key: string]: number }>({});
  const [updatedLeaderboard, setUpdatedLeaderboard] = useState<LeaderboardRow[]>([]);
  const [handledChallenges, setHandledChallenges] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('handledChallenges');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('handledChallenges', JSON.stringify(Array.from(handledChallenges)));
  }, [handledChallenges]);

  const sendChallenge = async (challengeeUsername: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('Niste prijavljeni!');

      const res = await fetch('http://localhost:5050/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ challengee_username: challengeeUsername }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Napaka pri pošiljanju izziva');

      console.log('Challenge sent:', data);
      await refetchChallenges();
    } catch (error) {
      console.error('Error sending challenge:', error);
    }
  };


  useEffect(() => {
    console.log("challenges:", challenges);
    console.log("userName:", userName);
    console.log("handledChallenges:", handledChallenges);
    if (!userName || !challenges) return;

    const pending = challenges.find(
      c =>
        c.challengee_username === userName &&
        !c.accepted &&
        !handledChallenges.has(c.id)
    );

    setActiveChallenge(pending || null);
    setShowChallengeModal(!!pending);
  }, [challenges, userName, handledChallenges]);


  useEffect(() => {
    if (leaderboardRows && leaderboardRows.length > 0) {
      setUpdatedLeaderboard(
        [...leaderboardRows].sort((a, b) => b.total_stars - a.total_stars)
      );
    } else {
      setUpdatedLeaderboard([]);
    }
  }, [leaderboardRows]);

  const isChallenged = (username: string): boolean => {
    if (!challenges || challenges.length === 0) return false;
    return challenges.some(c => c.challengee_username === username);
  };

  const handleAccept = () => {
    setShowQuiz(true);
  };

  const handleFinishQuiz = async (score: number, selectedAnswers: number[]) => {
    if (!activeChallenge) return;

    const starsWon = 3;
    const totalQuestions = 1;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5050/challenges/finish/${activeChallenge.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ stars: starsWon, score: score, totalQuestions: totalQuestions }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setHandledChallenges(prev => new Set(prev).add(activeChallenge.id));

      refetchLeaderboard();
      refetchChallenges();

      setActiveChallenge(prev => prev ? { ...prev, accepted: true } : null);
      setShowQuiz(false);
      setShowChallengeModal(false);

    } catch (error) {
      console.error("Napaka pri dokončanju izziva:", error);
    }
  };

  useEffect(() => {
    if (leaderboardRows && leaderboardRows.length > 0) {
      setUpdatedLeaderboard(
        leaderboardRows.sort((a, b) => b.total_stars - a.total_stars)
      );
    } else {
      setUpdatedLeaderboard([]);
    }
  }, [leaderboardRows]);



  const handleDecline = () => {
    if (!activeChallenge) return;
    setHandledChallenges(prev => new Set(prev).add(activeChallenge.id));
    setActiveChallenge(prev => prev ? { ...prev, accepted: true } : null);
    setShowChallengeModal(false);
    refetchChallenges();
  };


  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center p-8 mt-7">
      <div
        className="relative mx-auto overflow-hidden rounded-[8rem] bg-[#0F2F2C]"
        style={{
          aspectRatio: '344/216',
          width: 'min(calc(100vw - 240px), calc((100vh - 240px) * 344/216))',
          height: 'min(calc(100vw - 240px) * 216/344, calc(100vh - 240px))',
          boxShadow: '0 0 0 8px #C2CED9, 0 0 0 48px #EBEEF3',
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center p-16 gap-16">
          <h2 className="text-4xl font-bold text-white mb-4">Lestvica</h2>

          {isLoadingRows || isLoadingChallenges ? (
            <div className="flex flex-col items-center gap-4">
              <div className="border-primary-500 h-16 w-16 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : rowsError ? (
            <div className="text-red-400">Napaka pri nalaganju lestvice</div>
          ) : updatedLeaderboard.length === 0 ? (
            <div className="text-white">Ni podatkov za prikaz.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableHeadCell className="bg-transparent text-xl text-white">Mesto</TableHeadCell>
                  <TableHeadCell className="bg-transparent text-xl text-white">Uporabnik</TableHeadCell>
                  <TableHeadCell className="bg-transparent text-xl text-white">Skupno zvezdic</TableHeadCell>
                  <TableHeadCell className="bg-transparent text-xl text-white">Izzivi</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                  {updatedLeaderboard.map((row, index) => {
                    const challenged = isChallenged(row.user);
                    const hasStarChange = starChanges[row.user] !== undefined;
                    const starChange = starChanges[row.user] || 0;

                    return (
                      <TableRow key={row.user} className="border-gray-600 bg-transparent">
                        <TableCell className="text-xl font-medium text-white">{index + 1}</TableCell>
                        <TableCell className="text-xl text-white flex items-center gap-2">
                          {row.user}
                          {challenged && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                              ⚡ Challenged!
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-primary-400 flex items-center gap-2 text-2xl font-bold">
                              <FaStar />
                              {row.total_stars}
                            </div>
                            {hasStarChange && (
                              <span className={`text-sm font-bold ${starChange > 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {starChange > 0 ? `+${starChange}` : starChange}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {row.user === userName ? (
                            <span className="text-xl font-medium text-white">To si ti!</span>
                          ) : (
                            <Button
                              size="md"
                              color="light"
                              className="text-[#0F2F2C] text-xl font-bold"
                              onClick={() => sendChallenge(row.user)}
                              disabled={challenged}
                            >
                              {challenged ? 'Izziv poslan' : 'Izzovi'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      <Modal
        show={showChallengeModal}
        size="xl"
        popup
        onClose={() => {
          setShowChallengeModal(false);
          setShowQuiz(false);
        }}
      >
        <div className="p-6">
          {!showQuiz ? (
            <>
              <h3 className="text-2xl font-bold mb-4 text-center">
                Ali sprejmeš izziv od {activeChallenge?.challenger_username || "neznanega uporabnika"}?
              </h3>
              <p className="mb-6 text-center">
                Če izgubiš, boš izgubil zvezdice! Ali želiš sprejeti izziv?
              </p>
              <div className="flex justify-center gap-4">
                <Button color="success" onClick={handleAccept}>
                  Sprejmi
                </Button>
                <Button color="gray" onClick={handleDecline}>
                  Zavrni
                </Button>
              </div>
            </>
          ) : (
            <QuizChallenge
              challengerUsername={activeChallenge?.challenger_username || "Neznan"}
              onFinishQuiz={(score, selectedAnswers) => handleFinishQuiz(score, selectedAnswers)}
              onCancel={() => {
                setShowQuiz(false);
                setShowChallengeModal(false);
              }}
            />
          )}
        </div>
      </Modal>

    </div>
  );
}
