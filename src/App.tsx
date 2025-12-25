import React, { useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Droplets,
  Brain,
  Bell,
  BellOff,
  Volume2,
  Wind,
  Settings as SettingsIcon,
  Moon,
  Sun,
  X,
  Check,
} from "lucide-react";

interface Settings {
  focus: number;
  break: number;
}

type Mode = "focus" | "break";
type Theme = "dark" | "light";

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({ focus: 25, break: 5 });
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [pomodoroTime, setPomodoroTime] = useState<number>(settings.focus * 60);
  const [isPomodoroActive, setIsPomodoroActive] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>("focus");

  const HEALTH_CYCLE_SECONDS: number = 4 * 60 * 60;
  const [healthCycleTime, setHealthCycleTime] =
    useState<number>(HEALTH_CYCLE_SECONDS);
  const [isHealthActive, setIsHealthActive] = useState<boolean>(true);
  const [waterCount, setWaterCount] = useState<number>(0);

  const [theme, setTheme] = useState<Theme>("dark");
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(false);

  const speakMessage = useCallback((message: string): void => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "pt-BR";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const sendNotification = useCallback(
    (title: string, body: string): void => {
      if (notificationsEnabled && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "https://cdn-icons-png.flaticon.com/512/2073/2073019.png",
        });
      }
    },
    [notificationsEnabled]
  );

  const requestNotificationPermission = async (): Promise<void> => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      handlePomodoroEnd();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPomodoroActive, pomodoroTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isHealthActive && healthCycleTime > 0) {
      interval = setInterval(() => {
        setHealthCycleTime((prev) => prev - 1);
      }, 1000);
    } else if (healthCycleTime === 0) {
      handleHealthAlert();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHealthActive, healthCycleTime]);

  const handlePomodoroEnd = (): void => {
    setIsPomodoroActive(false);
    const isFocus = mode === "focus";
    const nextMode: Mode = isFocus ? "break" : "focus";
    const msg = isFocus ? "Hora da pausa curta!" : "Foco retomado!";

    speakMessage(msg);
    sendNotification("DevAtivo", msg);

    setMode(nextMode);
    setPomodoroTime(settings[nextMode] * 60);
  };

  const handleHealthAlert = (): void => {
    const alertMsg = "hora de levantar por 5 minutos e beber 500ml de água";
    speakMessage(alertMsg);
    sendNotification(
      "DevAtivo: Alerta de Saúde!",
      "Beba 500ml de água e faça um alongamento."
    );
    setHealthCycleTime(HEALTH_CYCLE_SECONDS);
    setWaterCount((prev) => prev + 500);
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
          .toString()
          .padStart(2, "0")}`
      : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const updateSettings = (key: keyof Settings, value: string): void => {
    const val = parseInt(value) || 1;
    const newSettings = { ...settings, [key]: val };
    setSettings(newSettings);
    if (!isPomodoroActive && mode === key) {
      setPomodoroTime(val * 60);
    }
  };

  const resetPomodoro = (): void => {
    setIsPomodoroActive(false);
    setPomodoroTime(settings[mode] * 60);
  };

  const getProgress = (current: number, total: number): number =>
    ((total - current) / total) * 100;

  const themeClasses =
    theme === "dark"
      ? {
          bg: "bg-slate-900",
          card: "bg-slate-800 border-slate-700 text-slate-100",
          inner: "bg-slate-900/50 border-slate-700/50",
          textMuted: "text-slate-400",
          buttonInactive: "bg-slate-700 text-slate-400",
          input: "bg-slate-700 border-slate-600 text-white",
        }
      : {
          bg: "bg-slate-50",
          card: "bg-white border-slate-200 text-slate-800 shadow-xl",
          inner: "bg-slate-100 border-slate-200",
          textMuted: "text-slate-500",
          buttonInactive: "bg-slate-200 text-slate-500",
          input: "bg-white border-slate-300 text-slate-800",
        };

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} flex flex-col items-center justify-center p-4 font-sans transition-colors duration-500`}
    >
      <div
        className={`max-w-md w-full ${themeClasses.card} rounded-3xl p-8 border relative overflow-hidden`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Brain
              className={
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }
            />
            <h1 className="text-xl font-bold tracking-tight">DevAtivo</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-full transition-colors ${themeClasses.buttonInactive}`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors ${themeClasses.buttonInactive}`}
            >
              <SettingsIcon size={18} />
            </button>
            <button
              onClick={requestNotificationPermission}
              className={`p-2 rounded-full transition-colors ${
                notificationsEnabled
                  ? "bg-indigo-500/20 text-indigo-500"
                  : themeClasses.buttonInactive
              }`}
            >
              {notificationsEnabled ? (
                <Bell size={18} />
              ) : (
                <BellOff size={18} />
              )}
            </button>
          </div>
        </div>

        {showSettings && (
          <div
            className={`absolute inset-0 z-10 ${themeClasses.card} p-8 flex flex-col`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Configurações</h2>
              <button onClick={() => setShowSettings(false)} className="p-1">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tempo de Foco (min)
                </label>
                <input
                  type="number"
                  value={settings.focus}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateSettings("focus", e.target.value)
                  }
                  className={`w-full p-2 rounded-lg border ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pausa Curta (min)
                </label>
                <input
                  type="number"
                  value={settings.break}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateSettings("break", e.target.value)
                  }
                  className={`w-full p-2 rounded-lg border ${themeClasses.input}`}
                />
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-auto bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Check size={20} /> Guardar Alterações
            </button>
          </div>
        )}

        <div
          className={`flex gap-2 mb-8 p-1 ${
            theme === "dark" ? "bg-slate-900" : "bg-slate-100"
          } rounded-xl`}
        >
          <button
            onClick={() => {
              setMode("focus");
              setPomodoroTime(settings.focus * 60);
              setIsPomodoroActive(false);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "focus"
                ? "bg-indigo-600 text-white shadow-lg"
                : themeClasses.textMuted
            }`}
          >
            Foco
          </button>
          <button
            onClick={() => {
              setMode("break");
              setPomodoroTime(settings.break * 60);
              setIsPomodoroActive(false);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "break"
                ? "bg-emerald-600 text-white shadow-lg"
                : themeClasses.textMuted
            }`}
          >
            Pausa
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className={
                  theme === "dark" ? "text-slate-700" : "text-slate-200"
                }
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={553}
                strokeDashoffset={
                  553 -
                  (553 * getProgress(pomodoroTime, settings[mode] * 60)) / 100
                }
                strokeLinecap="round"
                className={`transition-all duration-1000 ${
                  mode === "focus" ? "text-indigo-500" : "text-emerald-500"
                }`}
              />
            </svg>
            <span className="absolute text-5xl font-mono font-bold">
              {formatTime(pomodoroTime)}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setIsPomodoroActive(!isPomodoroActive)}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform active:scale-95 shadow-lg ${
              isPomodoroActive
                ? "bg-amber-500 text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            {isPomodoroActive ? (
              <Pause fill="currentColor" />
            ) : (
              <Play fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            onClick={resetPomodoro}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${themeClasses.buttonInactive} hover:opacity-80`}
          >
            <RotateCcw size={24} />
          </button>
        </div>

        <div className={`${themeClasses.inner} rounded-2xl p-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sky-500">
              <Droplets size={18} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Ciclo de Saúde
              </span>
            </div>
            <button
              onClick={() => setIsHealthActive(!isHealthActive)}
              className={`text-xs underline ${themeClasses.textMuted}`}
            >
              {isHealthActive ? "Pausar" : "Retomar"}
            </button>
          </div>

          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-mono font-bold">
              {formatTime(healthCycleTime)}
            </span>
            <span
              className={`text-[10px] font-medium uppercase ${themeClasses.textMuted}`}
            >
              Meta: 500ml H₂O
            </span>
          </div>

          <div
            className={`${
              theme === "dark" ? "bg-slate-700" : "bg-slate-300"
            } h-1.5 rounded-full overflow-hidden`}
          >
            <div
              className="bg-sky-500 h-full transition-all duration-1000"
              style={{
                width: `${getProgress(healthCycleTime, HEALTH_CYCLE_SECONDS)}%`,
              }}
            />
          </div>

          <div
            className={`mt-4 flex items-center gap-4 ${themeClasses.textMuted}`}
          >
            <div className="flex items-center gap-1">
              <Volume2 size={14} />
              <span className="text-[10px]">Voz Ativa</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind size={14} />
              <span className="text-[10px]">Hoje: {waterCount}ml</span>
            </div>
          </div>
        </div>
      </div>

      <p
        className={`mt-8 text-center text-sm max-w-xs ${themeClasses.textMuted}`}
      >
        {notificationsEnabled
          ? "✓ Notificações e alertas sonoros ativos."
          : "ℹ Clique no sino para ativar notificações push."}
      </p>
    </div>
  );
};

export default App;
