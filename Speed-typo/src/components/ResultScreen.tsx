import { GameResult } from '../types/GameResult';
import { SaveStatus } from '../App';
import { ClaimedChallenge } from '../lib/challenges';
import { useI18n } from '../lib/i18n';

interface ResultScreenProps {
  result: GameResult;
  saveStatus: SaveStatus;
  claimed: ClaimedChallenge[];
  onRestart: () => void;
  hardcore?: boolean;
}

const SAVE_KEY: Record<SaveStatus, { key: string; className: string } | null> = {
  idle: null,
  saving: { key: 'saveSaving', className: 'text-gray-400' },
  saved: { key: 'saveSaved', className: 'text-green-400' },
  error: { key: 'saveError', className: 'text-red-400' },
  anon: { key: 'saveAnon', className: 'text-yellow-400' },
};

const ResultScreen: React.FC<ResultScreenProps> = ({ result, saveStatus, claimed, onRestart, hardcore = false }) => {
  const { score, wordCount, accuracy, wpm } = result;
  const { t, challengeTitle } = useI18n();
  const gradient = hardcore ? 'from-red-500 to-orange-500' : 'from-purple-400 to-pink-600';
  const btnGradient = hardcore
    ? 'from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
    : 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';

  const message = () => {
    if (score >= 500 && accuracy >= 90) return t('msg1');
    if (score >= 300 && accuracy >= 80) return t('msg2');
    if (score >= 200 && accuracy >= 70) return t('msg3');
    if (score >= 100) return t('msg4');
    return t('msg5');
  };

  const save = SAVE_KEY[saveStatus];

  return (
    <div className="max-w-md w-full text-center">
      <h1 className={`text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
        {t('gameOver')}
      </h1>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl mb-8 shadow-2xl">
        <div className="text-5xl font-bold mb-6">
          {score}
          <span className="text-sm text-gray-400 ml-2">{t('score').toLowerCase()}</span>
        </div>
        <p className="text-xl mb-4">{message()}</p>
        {save && <p className={`text-sm mb-4 ${save.className}`}>{t(save.key)}</p>}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <div className="text-sm text-gray-400">{t('words')}</div>
            <div className="text-2xl font-bold text-green-400">{wordCount}</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <div className="text-sm text-gray-400">{t('wpm')}</div>
            <div className="text-2xl font-bold text-purple-400">{wpm}</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <div className="text-sm text-gray-400">{t('accuracy')}</div>
            <div className="text-2xl font-bold text-blue-400">{accuracy}%</div>
          </div>
        </div>
      </div>

      {claimed.length > 0 && (
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl mb-8 shadow-2xl border border-green-500/40">
          <div className="text-sm font-semibold text-green-400 mb-2">
            {claimed.length === 1
              ? t('challengeDoneOne')
              : `${claimed.length} ${t('challengeDoneMany')}`}
          </div>
          <ul className="space-y-1">
            {claimed.map((c) => (
              <li key={c.challenge_id} className="flex justify-between text-sm">
                <span className="text-gray-200">{challengeTitle(c.title)}</span>
                <span className="text-purple-400 font-semibold">+{c.points_earned} pts</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onRestart}
        className={`px-8 py-3 bg-gradient-to-r ${btnGradient} rounded-lg text-lg font-bold transform transition-all hover:scale-105 shadow-lg`}
      >
        {t('playAgain')}
      </button>
    </div>
  );
};

export default ResultScreen;
