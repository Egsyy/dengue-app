"use client";

import React, { useEffect, useState } from "react";
import { Tabs, Card, Button, Text, Group, TextInput, Stack, useMantineTheme, Select, Alert, Divider, Loader, Checkbox } from "@mantine/core";
import TrainingAPI from "@/libraries/api/TrainingAPI";
import AdminDengueAPI from "@/libraries/api/AdminDengueAPI";
import WeatherSummaryAPI from "@/libraries/api/WeatherSummaryAPI";
import useSWR from "swr";
import { Localities } from "@/libraries/api/AdministrativeAreaAPI";
import { WeatherPoolingData } from "@/libraries/api/WeatherPoolingAPI";
import { showNotification, updateNotification } from "@mantine/notifications";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";
import AuthAPI, { getStoredUser, decodeJwt, storeUser } from "@/libraries/api/Auth";
import { useRouter } from "next/dist/client/components/navigation";
import { MantineCalendar } from "@/libraries/ui/MantineCalendar";
import { AdvisoryManagement } from "./AdvisoryManagement";
import { WeeklyDengueCasesManagement } from "./WeeklyDengueCasesManagement";


export default function AdminPage() {
  const router = useRouter();
  const theme = useMantineTheme();


  const [modelInfo, setModelInfo] = useState<any>(null);
  const { data: swModelInfo, mutate: mutateModelInfo } = useSWR("/api/training-data/model-info", () => TrainingAPI.getAdvanceModelInfo(), { revalidateOnFocus: false });
  const [isTraining, setIsTraining] = useState(false);
  const [operationId, setOperationId] = useState<string | null>(null);
  const [hubConnection, setHubConnection] = useState<HubConnection | null>(null);
  const [psgc, setPsgc] = useState("");
  const [date, setDate] = useState("");
  const [csvYears, setCsvYears] = useState<string>(new Date().getUTCFullYear().toString());
  const [csvPsgc, setCsvPsgc] = useState<string>("0931700000");
  const [csvExcludePsgc, setCsvExcludePsgc] = useState<boolean>(false);
  const [csvWeekNumber, setCsvWeekNumber] = useState<string>("");
  const [csvWeekFrom, setCsvWeekFrom] = useState<string>("");
  const [csvWeekTo, setCsvWeekTo] = useState<string>("");
  const [csvRequestKey, setCsvRequestKey] = useState<string | null>(null);
  const [barangays, setBarangays] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const municipalityPsgcCode = "0931700000";

    (async () => {
      try {
        const list: any[] = await Localities.getAllBarangaysByPsgccode(municipalityPsgcCode);
        if (!mounted) return;
        setBarangays(
          list.map((b) => ({
            value: b.psgcCode,
            label: b.name,
          })),
        );
      } catch (e) {
        console.error("Failed to load barangays", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // SWR-driven CSV generation
  const { data: csvBlob, error: csvError } = useSWR(
    csvRequestKey ? ["training-csv", csvRequestKey] : null,
    () => TrainingAPI.generateWeeklyWeatherCsv(JSON.parse(csvRequestKey || "null")),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (csvBlob) {
      const href = URL.createObjectURL(csvBlob as any);
      const link = document.createElement("a");
      link.href = href;
      link.download = "weekly-training-data-all.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      updateNotification({ id: "csv-download", title: "CSV downloaded", message: "weekly-training-data-all.csv saved — check your browser downloads.", color: "teal", loading: false, autoClose: 5000 });
      setCsvRequestKey(null);
    }
  }, [csvBlob]);

  useEffect(() => {
    if (csvError && csvRequestKey) {
      updateNotification({ id: "csv-download", title: "CSV failed", message: (csvError as Error).message || "Failed to generate CSV", color: "red", loading: false, autoClose: 8000 });
      setCsvRequestKey(null);
    }
  }, [csvError, csvRequestKey]);

  useEffect(() => {
    if (swModelInfo) setModelInfo(swModelInfo);
    // establish signalR connection for training updates
    const base = process.env.NEXT_PUBLIC_DENGUE_API?.replace(/\/$/, "") || "";
    const hub = new HubConnectionBuilder()
      .withUrl(`${base}/hubs/notifications`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    hub.start()
      .then(() => {
        hub.on("TrainingStarted", (payload: any) => {
          setIsTraining(true);
          setOperationId(payload?.OperationId || null);
          showNotification({ title: "Training", message: "Training started", loading: true });
        });

        hub.on("TrainingCompleted", (payload: any) => {
          setIsTraining(false);
          setOperationId(null);
          // payload may contain ModelInfo and Metrics
          if (payload?.ModelInfo) setModelInfo(payload.ModelInfo);
          else TrainingAPI.getAdvanceModelInfo().then((d) => setModelInfo(d)).catch(() => {});
          // update SWR cache
          mutateModelInfo();
          showNotification({ title: "Training", message: "Training completed", color: "teal" });
        });

        hub.on("TrainingFailed", (payload: any) => {
          setIsTraining(false);
          setOperationId(null);
          showNotification({ title: "Training Failed", message: payload?.Error || "Unknown error", color: "red" });
        });
      })
      .catch((e) => console.warn("SignalR failed to start", e));

    setHubConnection(hub);

    return () => {
      try {
        hub.stop();
      } catch {}
    };
  }, []);

   useEffect(() => {

      
      const checkAuthentication = () => {
        
          // Use the utility function from Auth.ts to get stored user
          const userData = getStoredUser();
          console.info("Stored user data:", userData);
          
          if (!userData) {
                router.push("/auth/signin");
            return;
          }
      }
      
      checkAuthentication();
    }, [router]);


  const appendLog = (text: string) => {

};

  // Ensure access token is refreshed using backend refresh endpoint (backend sets refresh token cookie)
  const ensureFreshAccess = async () => {
    try {
      const stored = getStoredUser();
      if (!stored) return;
      // Call refresh - backend reads refresh token cookie and returns new access token
      const res: any = await AuthAPI.refresh({ refreshToken: "" }).catch(() => null);
      if (res && res.success && res.accessToken) {
        // Persist updated token
        storeUser({ ...(stored || {}), accessToken: res.accessToken });
      }
    } catch (e) {
      // ignore
    }
  };



  const handleTrainAdvance = async () => {
    appendLog("Starting advanced training...");
    await ensureFreshAccess();
    try {
      const res: any = await TrainingAPI.trainAdvanceModel();
      // server returns operation id for queued training
      const opId = typeof res === "string" ? res : res?.operationId || res;
      setOperationId(opId || null);
      setIsTraining(true);
      appendLog("Advanced training queued");
      showNotification({ title: "Training", message: "Training queued", loading: true });
    } catch (e) {
      appendLog("Advanced training failed");
      showNotification({ title: "Error", message: "Advanced training failed" });
    }
  };

  const handlePredict = async () => {
    appendLog(`Triggering prediction for ${psgc} ${date}`);
    await ensureFreshAccess();
    try {
      const res = await AdminDengueAPI.manualAdvancePrediction(psgc, date);
      appendLog("Prediction request submitted");
      showNotification({ title: "Prediction", message: "Prediction requested" });
      appendLog(JSON.stringify(res));
    } catch (e) {
      appendLog("Prediction request failed");
      showNotification({ title: "Error", message: "Prediction failed" });
    }
  };

  const handleCreateBulk = async () => {
    console.log("Creating CSV for bulk prediction...");
    await ensureFreshAccess();
    try {
      const response = await AdminDengueAPI.createBulkCsvForPrediction({}) as any;
      console.log("Create-bulk triggered");
      showNotification({ 
        title: "Bulk CSV Created", 
        message: "Bulk CSV file has been created successfully and is ready for download." 
      });
      
      // Create a downloadable link if the response contains a file URL
      if (response && response.fileUrl) {
        const link = document.createElement('a');
        link.href = response.fileUrl;
        link.download = 'bulk_prediction.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.log("Create-bulk failed");
      showNotification({ title: "Error", message: "Create bulk failed" });
    }
  };

  const handleYearlyLagged = async () => {
    appendLog("Triggering yearly-lagged advance...");
    await ensureFreshAccess();
    try {
      await AdminDengueAPI.createYearlyLaggedAdvance({});
      appendLog("Yearly-lagged triggered");
      showNotification({ title: "Yearly", message: "Yearly-lagged triggered" });
    } catch (e) {
      appendLog("Yearly-lagged failed");
      showNotification({ title: "Error", message: "Yearly-lagged failed" });
    }
  };



  const fetchWeather = async () => {
    try {
      const current = await WeatherSummaryAPI.getCurrentWeek();
      console.log("Weather current-week: " + JSON.stringify(current));
      const lagged = await WeatherSummaryAPI.getLagged2Week();
      console.log("Weather lagged-2week: " + JSON.stringify(lagged));
    } catch (e) {
      console.log("Weather fetch failed");
    }
  };

  const handleManualWeatherPooling = async () => {
    try {
      await WeatherPoolingData.manualTriggerWeatherPooling();
      showNotification({ 
        title: "Weather Pooling", 
        message: "Weather pooling job has been manually triggered successfully." 
      });
    } catch (e) {
      console.log("Weather pooling manual trigger failed");
      showNotification({ 
        title: "Error", 
        message: "Failed to trigger weather pooling job." 
      });
    }
  };

  return (
    <Card shadow="sm" padding="md">
      <Text size="xl" fw={700} style={{ marginBottom: theme.spacing.md }}>
        Admin
      </Text>

      <Tabs defaultValue="model">
        <Tabs.List>
          <Tabs.Tab value="model">Model</Tabs.Tab>
          {/* <Tabs.Tab value="predictions">Predictions</Tabs.Tab>
          <Tabs.Tab value="weather">Weather</Tabs.Tab> */}
          <Tabs.Tab value="weekly-cases">Weekly Cases</Tabs.Tab>
          <Tabs.Tab value="advisories">Advisories</Tabs.Tab>
        </Tabs.List>

        { /** <Tabs.Panel value="model" style={{ paddingTop: theme.spacing.xs }}>
          <Stack gap="sm">
            <Text fw={600}>Model Info</Text>
            <Alert variant="light" color="blue" title="Disclaimer">
              <Text size="sm">
                Use the Train Advanced button to retrain the prediction model with the latest data. 
                This process may take several minutes to complete. Ensure you have sufficient data 
                before initiating training.
              </Text>
            </Alert>
            <Alert variant="light" color="yellow" title="Training CSV">
              <Text size="sm">
                To generate training data CSV, click "Generate Training CSV (All)". Download the CSV,
                edit or remove rows not needed for training, then replace the file at
                <br />
                <Text component="span" fw={700}>dengue-watch-api/infrastructure/ml/data/adv-weekly-training-data.csv</Text>
                <br />
                After replacing the file, return here and press "Train Advanced" to enqueue model training.
              </Text>
            </Alert>
                    <Stack gap="xs">
                      <Text size="sm">CSV Parameters</Text>
                      <TextInput label="PSGC Code" value={csvPsgc} onChange={(e) => setCsvPsgc(e.target.value)} />
                      <TextInput label="Years (comma separated)" value={csvYears} onChange={(e) => setCsvYears(e.target.value)} />
                      <TextInput label="Week Number (optional)" value={csvWeekNumber} onChange={(e) => setCsvWeekNumber(e.target.value)} />
                      <Group>
                        <TextInput placeholder="Week From" value={csvWeekFrom} onChange={(e) => setCsvWeekFrom(e.target.value)} w={120} />
                        <TextInput placeholder="Week To" value={csvWeekTo} onChange={(e) => setCsvWeekTo(e.target.value)} w={120} />
                      </Group>
                      <Group>
                        <Checkbox label="Exclude PSGC in result" checked={csvExcludePsgc} onChange={(e) => setCsvExcludePsgc(e.currentTarget.checked)} />
                        <Button
                          color="gray"
                          onClick={async () => {
                            await ensureFreshAccess();
                            try {
                              const years = csvYears.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
                              if (years.length === 0) {
                                showNotification({ title: "Error", message: "Provide at least one year" });
                                return;
                              }
                              const body: any = {
                                PsgcCode: csvPsgc,
                                isPsgcExcludedInResult: csvExcludePsgc,
                                Years: years,
                              } as any;
                              if (csvWeekNumber) body.WeekNumber = parseInt(csvWeekNumber, 10);
                              if (csvWeekFrom && csvWeekTo) body.WeekRange = { From: parseInt(csvWeekFrom, 10), To: parseInt(csvWeekTo, 10) };

                              // Trigger SWR fetcher by setting a serialized key
                              setCsvRequestKey(JSON.stringify(body));
                              // show a persistent loading notification we can update later
                              showNotification({ id: "csv-download", title: "CSV", message: "Generating training CSV...", loading: true, autoClose: true });
                            } catch (e: any) {
                              console.error(e);
                              showNotification({ title: "Error", message: e?.message || "Failed to generate CSV" });
                            }
                          }}
                        >
                          Generate Training CSV (All)
                        </Button>
                        <Button variant="outline" onClick={() => { setCsvYears(new Date().getUTCFullYear().toString()); setCsvPsgc("0931700000"); setCsvExcludePsgc(false); setCsvWeekFrom(""); setCsvWeekTo(""); setCsvWeekNumber(""); }}>Reset</Button>
                      </Group>
                    </Stack>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(modelInfo, null, 2)}</pre>
            <Group>
              <Button onClick={handleTrainAdvance} disabled={isTraining}>
                {isTraining ? (
                  <>
                    <Loader size="xs" style={{ marginRight: 8 }} /> Training...
                  </>
                ) : (
                  "Train Advanced"
                )}
              </Button>
              {operationId && <Text size="sm">Operation: {operationId}</Text>}
            </Group>
          </Stack>
        </Tabs.Panel> */}
                {
                  /**
                   * <Tabs.Panel value="predictions" style={{ paddingTop: theme.spacing.xs }}>
          <Stack gap="sm">
            <Text fw={600}>Manual Predictions</Text>
            <Alert variant="light" color="blue" title="Disclaimer">
              <Text size="sm">
                Select a barangay from the dropdown and enter a date in yyyy-MM-dd format to run predictions. 
                The Run Prediction button generates dengue case predictions for the selected location and date. 
                Create Bulk CSV generates a template file for batch predictions. Yearly Lagged processes 
                historical data for improved model accuracy.
              </Text>
            </Alert>
            <Select
              label="Select Barangay"
              placeholder="Choose a barangay"
              data={barangays}
              value={selectedBarangay}
              onChange={(value) => {
                setSelectedBarangay(value);
                setPsgc(value || "");
              }}
              searchable
            />
            <TextInput label="Date (yyyy-MM-dd)" value={date} onChange={(e) => setDate(e.target.value)} />
            <Group>
              <Button onClick={handlePredict}>Run Prediction</Button>
              <Button onClick={handleCreateBulk}>Create Bulk CSV</Button>
              <Button onClick={handleYearlyLagged}>Yearly Lagged</Button>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="weather" style={{ paddingTop: theme.spacing.xs }}>
          <Stack gap="sm">
            <Text fw={600}>Weather Summaries</Text>
            <Alert variant="light" color="blue" title="Disclaimer">
              <Text size="sm">
                Use the Fetch Weather Summaries button to manually retrieve the latest weather data. 
                This data is essential for accurate dengue predictions as weather conditions significantly 
                impact mosquito breeding and disease transmission patterns. The Manual Weather Pooling 
                button triggers the job that fetches weather data from external APIs.
              </Text>
            </Alert>
            <Group>
              <Button onClick={fetchWeather}>Fetch Weather Summaries</Button>
              <Button onClick={handleManualWeatherPooling}>Manual Weather Pooling</Button>
            </Group>
          </Stack>
        </Tabs.Panel>
                   */
                }
        

        <Tabs.Panel value="weekly-cases" style={{ paddingTop: theme.spacing.xs }}>
          <WeeklyDengueCasesManagement />
        </Tabs.Panel>

        <Tabs.Panel value="advisories" style={{ paddingTop: theme.spacing.xs }}>
          <AdvisoryManagement />
        </Tabs.Panel>


      </Tabs>


    </Card>
  );
}
