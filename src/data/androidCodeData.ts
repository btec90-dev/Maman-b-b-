export interface AndroidFile {
  filename: string;
  category: 'manifest' | 'gradle' | 'room' | 'repository' | 'viewmodel' | 'compose_ui' | 'theme' | 'sample_data' | 'localization' | 'ai_assistant' | 'camera_photos';
  description: string;
  code: string;
}

export const ANDROID_CODE_FILES: AndroidFile[] = [
  {
    filename: 'AndroidManifest.xml',
    category: 'manifest',
    description: 'Complete Android permissions, foreground service for kick timer, notifications, alarms & activities',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.maman.bebe.tracker">

    <!-- Push notifications for medication & water reminders -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Precise scheduling for daily prenatal vitamin & kick session reminders -->
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Foreground service to keep feeding/kick timers alive when screen is off -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />

    <!-- Optional bump photo memories from camera or gallery -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <!-- Haptic feedback for kick counter tactile button -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:name=".MamanApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:localeConfig="@xml/locales_config"
        android:theme="@style/Theme.MamanBebe"
        tools:targetApi="35">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.MamanBebe"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Foreground Service for ongoing Nursing & Kick Stopwatch -->
        <service
            android:name=".service.ActiveTimerForegroundService"
            android:exported="false"
            android:foregroundServiceType="specialUse" />

        <!-- Receiver for Medication & Appointment Alarms -->
        <receiver
            android:name=".receiver.MedicationAlarmReceiver"
            android:exported="false" />

    </application>
</manifest>`,
  },
  {
    filename: 'build.gradle.kts',
    category: 'gradle',
    description: 'Kotlin DSL build configuration with Jetpack Compose BOM, Room KSP, Material 3 & Navigation',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.ksp)
    alias(libs.plugins.hilt.android)
}

android {
    namespace = "com.maman.bebe.tracker"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.maman.bebe.tracker"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Jetpack Compose BOM
    val composeBom = platform("androidx.compose:compose-bom:2024.09.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.0")

    // Room Database & KSP
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // ViewModel & Lifecycle
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.5")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.5")

    // Coroutines & Flow
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    // Hilt Dependency Injection
    implementation("com.google.dagger:hilt-android:2.51.1")
    ksp("com.google.dagger:hilt-compiler:2.51.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")
}`,
  },
  {
    filename: 'RoomEntities.kt',
    category: 'room',
    description: 'Room Entities for Baby Profile, Pregnancy Daily Logs, Kick Sessions, and Newborn Tracker',
    code: `package com.maman.bebe.tracker.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.LocalDate

@Entity(tableName = "baby_profile")
data class BabyProfileEntity(
    @PrimaryKey val id: String = "default_user",
    val motherName: String,
    val babyName: String,
    val babyNameTwin: String? = null,
    val isTwinMode: Boolean = false,
    val calculationMethod: String = "LMP", // LMP, CONCEPTION, ULTRASOUND
    val dueDate: String, // ISO YYYY-MM-DD
    val lmpDate: String? = null,
    val activeStage: String = "PREGNANCY", // PREGNANCY or BABY
    val babyBirthDate: String? = null
)

@Entity(tableName = "kick_sessions")
data class KickSessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val durationSeconds: Long,
    val kickCount: Int,
    val kickIntervalsCsv: String, // Comma separated intervals in seconds
    val fetalStatus: String = "ACTIVE",
    val notes: String? = null
)

@Entity(tableName = "pregnancy_daily_logs")
data class PregnancyLogEntity(
    @PrimaryKey val date: String, // YYYY-MM-DD
    val maternalWeightKg: Float? = null,
    val symptomsCsv: String = "", // e.g., "Nausea:MODERATE,Backache:MILD"
    val mood: String? = null,
    val notes: String? = null
)

@Entity(tableName = "baby_feeding_logs")
data class BabyFeedingLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val feedType: String, // "BREAST" or "BOTTLE"
    val leftDurationSeconds: Int = 0,
    val rightDurationSeconds: Int = 0,
    val bottleAmountMl: Float? = null,
    val bottleContents: String? = null, // "BREAST_MILK" or "FORMULA"
    val notes: String? = null
)

@Entity(tableName = "baby_diaper_logs")
data class BabyDiaperLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val diaperType: String, // "WET", "DIRTY", "BOTH"
    val stoolColor: String? = null,
    val consistency: String? = null,
    val notes: String? = null
)

@Entity(tableName = "registry_items")
data class RegistryItemEntity(
    @PrimaryKey val id: String,
    val category: String,
    val name: String,
    val priority: String, // MUST_HAVE, NICE_TO_HAVE, CAN_WAIT
    val quantity: Int = 1,
    val isPurchased: Boolean = false,
    val estimatedPrice: Float? = null,
    val notes: String? = null
)`,
  },
  {
    filename: 'MamanDatabase.kt',
    category: 'room',
    description: 'Room Database definition with DAOs and TypeConverters',
    code: `package com.maman.bebe.tracker.data.local

import androidx.room.*
import com.maman.bebe.tracker.data.local.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface PregnancyDao {
    @Query("SELECT * FROM baby_profile LIMIT 1")
    fun getProfileFlow(): Flow<BabyProfileEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertProfile(profile: BabyProfileEntity)

    @Query("SELECT * FROM kick_sessions ORDER BY timestamp DESC")
    fun getAllKickSessions(): Flow<List<KickSessionEntity>>

    @Insert
    suspend fun insertKickSession(session: KickSessionEntity)

    @Query("SELECT * FROM pregnancy_daily_logs ORDER BY date DESC")
    fun getAllDailyLogs(): Flow<List<PregnancyLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertDailyLog(log: PregnancyLogEntity)
}

@Dao
interface BabyLogDao {
    @Query("SELECT * FROM baby_feeding_logs ORDER BY timestamp DESC")
    fun getRecentFeedings(): Flow<List<BabyFeedingLogEntity>>

    @Insert
    suspend fun insertFeeding(feed: BabyFeedingLogEntity)

    @Query("SELECT * FROM baby_diaper_logs ORDER BY timestamp DESC")
    fun getRecentDiapers(): Flow<List<BabyDiaperLogEntity>>

    @Insert
    suspend fun insertDiaper(diaper: BabyDiaperLogEntity)
}

@Database(
    entities = [
        BabyProfileEntity::class,
        KickSessionEntity::class,
        PregnancyLogEntity::class,
        BabyFeedingLogEntity::class,
        BabyDiaperLogEntity::class,
        RegistryItemEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class MamanDatabase : RoomDatabase() {
    abstract fun pregnancyDao(): PregnancyDao
    abstract fun babyLogDao(): BabyLogDao
}`,
  },
  {
    filename: 'PregnancyRepository.kt',
    category: 'repository',
    description: 'Clean Architecture Repository providing reactive Flow data streams to ViewModels',
    code: `package com.maman.bebe.tracker.domain.repository

import com.maman.bebe.tracker.data.local.PregnancyDao
import com.maman.bebe.tracker.data.local.entity.BabyProfileEntity
import com.maman.bebe.tracker.data.local.entity.KickSessionEntity
import com.maman.bebe.tracker.data.local.entity.PregnancyLogEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

interface PregnancyRepository {
    fun getProfile(): Flow<BabyProfileEntity?>
    suspend fun updateProfile(profile: BabyProfileEntity)
    fun getKickSessions(): Flow<List<KickSessionEntity>>
    suspend fun saveKickSession(session: KickSessionEntity)
    fun getDailyLogs(): Flow<List<PregnancyLogEntity>>
    suspend fun logDailyMetrics(log: PregnancyLogEntity)
}

@Singleton
class PregnancyRepositoryImpl @Inject constructor(
    private val pregnancyDao: PregnancyDao
) : PregnancyRepository {

    override fun getProfile(): Flow<BabyProfileEntity?> =
        pregnancyDao.getProfileFlow()

    override suspend fun updateProfile(profile: BabyProfileEntity) {
        pregnancyDao.upsertProfile(profile)
    }

    override fun getKickSessions(): Flow<List<KickSessionEntity>> =
        pregnancyDao.getAllKickSessions()

    override suspend fun saveKickSession(session: KickSessionEntity) {
        pregnancyDao.insertKickSession(session)
    }

    override fun getDailyLogs(): Flow<List<PregnancyLogEntity>> =
        pregnancyDao.getAllDailyLogs()

    override suspend fun logDailyMetrics(log: PregnancyLogEntity) {
        pregnancyDao.upsertDailyLog(log)
    }
}`,
  },
  {
    filename: 'PregnancyHomeViewModel.kt',
    category: 'viewmodel',
    description: 'MVVM ViewModel managing due date calculations, current week progress, and size themes',
    code: `package com.maman.bebe.tracker.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.maman.bebe.tracker.data.local.entity.BabyProfileEntity
import com.maman.bebe.tracker.domain.repository.PregnancyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import javax.inject.Inject

enum class SizeTheme { FRUITS, SPORTS, SNACKS, ANIMALS }

data class PregnancyHomeUiState(
    val motherName: String = "Mama",
    val babyName: String = "Little One",
    val isTwinMode: Boolean = false,
    val currentWeek: Int = 24,
    val currentDayOfWeek: Int = 3,
    val daysRemaining: Long = 112,
    val progressPercent: Float = 0.60f,
    val selectedSizeTheme: SizeTheme = SizeTheme.FRUITS,
    val selectedWeekDetail: Int = 24,
    val isLoading: Boolean = false
)

@HiltViewModel
class PregnancyHomeViewModel @Inject constructor(
    private val repository: PregnancyRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(PregnancyHomeUiState())
    val uiState: StateFlow<PregnancyHomeUiState> = _uiState.asStateFlow()

    init {
        loadProfile()
    }

    private fun loadProfile() {
        viewModelScope.launch {
            repository.getProfile().collectLatest { profile ->
                profile?.let { updateStateWithProfile(it) }
            }
        }
    }

    fun setSizeTheme(theme: SizeTheme) {
        _uiState.update { it.copy(selectedSizeTheme = theme) }
    }

    fun selectWeek(week: Int) {
        _uiState.update { it.copy(selectedWeekDetail = week.coerceIn(4, 42)) }
    }

    fun toggleTwinMode(enabled: Boolean) {
        viewModelScope.launch {
            val current = _uiState.value
            _uiState.update { it.copy(isTwinMode = enabled) }
        }
    }

    private fun updateStateWithProfile(profile: BabyProfileEntity) {
        val due = LocalDate.parse(profile.dueDate)
        val today = LocalDate.now()
        val totalPregnancyDays = 280L
        val daysUntilDue = ChronoUnit.DAYS.between(today, due).coerceAtLeast(0)
        val daysPassed = (totalPregnancyDays - daysUntilDue).coerceAtLeast(0)
        val currentWeek = ((daysPassed / 7) + 1).toInt().coerceIn(1, 42)
        val currentDay = (daysPassed % 7).toInt()

        _uiState.update {
            it.copy(
                motherName = profile.motherName,
                babyName = profile.babyName,
                isTwinMode = profile.isTwinMode,
                currentWeek = currentWeek,
                currentDayOfWeek = currentDay,
                daysRemaining = daysUntilDue,
                progressPercent = (daysPassed.toFloat() / totalPregnancyDays).coerceIn(0f, 1f),
                selectedWeekDetail = currentWeek
            )
        }
    }
}`,
  },
  {
    filename: 'PregnancyHomeScreen.kt',
    category: 'compose_ui',
    description: 'Jetpack Compose Primary Screen: Material 3 Cards, Canvas 3D Fetal Stage, and Fun Size Selector',
    code: `package com.maman.bebe.tracker.presentation.home

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PregnancyHomeScreen(
    viewModel: PregnancyHomeViewModel,
    onNavigateToKickCounter: () -> Unit,
    onNavigateToBabyLogger: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Maman & bébé",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Week \${state.currentWeek}, Day \${state.currentDayOfWeek} · \${state.daysRemaining} days left",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    // Twin Mode Toggle Badge
                    FilterChip(
                        selected = state.isTwinMode,
                        onClick = { viewModel.toggleTwinMode(!state.isTwinMode) },
                        label = { Text(if (state.isTwinMode) "Twins" else "Single") },
                        leadingIcon = {
                            Icon(Icons.Default.ChildCare, contentDescription = null, modifier = Modifier.size(16.dp))
                        }
                    )
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Medical Disclaimer Banner (Required)
            Surface(
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Info,
                        contentDescription = "Medical Disclaimer",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = "For informational purposes only; not a substitute for professional medical advice.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Central 3D / Visual Baby Stage Card
            BabyStageVisualCard(
                week = state.selectedWeekDetail,
                isTwin = state.isTwinMode
            )

            // Fun Size Comparison Segmented Bar & Stats
            SizeComparisonSection(
                theme = state.selectedSizeTheme,
                onThemeSelected = { viewModel.setSizeTheme(it) },
                week = state.selectedWeekDetail
            )

            // Week Scroller Carousel
            Text(
                text = "Week by Week Timeline",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold)
            )
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 4.dp)
            ) {
                items((4..40 step 2).toList()) { weekNum ->
                    val isSelected = weekNum == state.selectedWeekDetail
                    Surface(
                        onClick = { viewModel.selectWeek(weekNum) },
                        shape = RoundedCornerShape(16.dp),
                        color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.width(64.dp).height(74.dp)
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "Wk",
                                fontSize = 11.sp,
                                color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "\$weekNum",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }

            // Quick Shortcuts Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedCard(
                    onClick = onNavigateToKickCounter,
                    modifier = Modifier.weight(1f)
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Icon(Icons.Default.TouchApp, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.height(8.dp))
                        Text("Kick Counter", fontWeight = FontWeight.SemiBold)
                        Text("Count to 10 session", style = MaterialTheme.typography.bodySmall)
                    }
                }
                OutlinedCard(
                    onClick = onNavigateToBabyLogger,
                    modifier = Modifier.weight(1f)
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Icon(Icons.Default.BabyChangingStation, contentDescription = null, tint = MaterialTheme.colorScheme.secondary)
                        Spacer(Modifier.height(8.dp))
                        Text("Baby Tracker", fontWeight = FontWeight.SemiBold)
                        Text("Feeds & Diapers", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}

@Composable
fun BabyStageVisualCard(week: Int, isTwin: Boolean) {
    ElevatedCard(
        shape = RoundedCornerShape(24.dp),
        modifier = Modifier.fillMaxWidth().height(240.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            Color(0xFFFBEAEB),
                            Color(0xFFEAF1EB)
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = if (isTwin) "Twin Babies at Week \$week" else "Baby at Week \$week",
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                )
                Text(
                    text = "Amniotic Sac Heartbeat: ~140 bpm",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.DarkGray
                )
            }
        }
    }
}

@Composable
fun SizeComparisonSection(theme: SizeTheme, onThemeSelected: (SizeTheme) -> Unit, week: Int) {
    // Segmented theme picker
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        SizeTheme.values().forEach { t ->
            val selected = t == theme
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (selected) MaterialTheme.colorScheme.surface else Color.Transparent)
                    .clickable { onThemeSelected(t) }
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = t.name.lowercase().replaceFirstChar { it.uppercase() },
                    fontSize = 12.sp,
                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                )
            }
        }
    }
}`,
  },
  {
    filename: 'BabyLoggerScreen.kt',
    category: 'compose_ui',
    description: 'Jetpack Compose Baby Tracker: Breastfeeding timer with L/R toggle, Diaper counter & Sleep sessions',
    code: `package com.maman.bebe.tracker.presentation.baby

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun BabyLoggerScreen() {
    var activeBreastSide by remember { mutableStateOf<String?>("LEFT") }
    var isTimerRunning by remember { mutableStateOf(false) }
    var leftSeconds by remember { mutableStateOf(420) } // 7m
    var rightSeconds by remember { mutableStateOf(300) } // 5m

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Daily Newborn Logger", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)

        // Nursing Dual Side Timer
        Card(
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("Breastfeeding Timer", fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    // Left Breast
                    Button(
                        onClick = { activeBreastSide = "LEFT"; isTimerRunning = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (activeBreastSide == "LEFT") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                        )
                    ) {
                        Text("Left Side (\${leftSeconds / 60}m \${leftSeconds % 60}s)")
                    }

                    // Right Breast
                    Button(
                        onClick = { activeBreastSide = "RIGHT"; isTimerRunning = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (activeBreastSide == "RIGHT") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                        )
                    ) {
                        Text("Right Side (\${rightSeconds / 60}m \${rightSeconds % 60}s)")
                    }
                }
            }
        }

        // Diaper Quick Tracker
        Text("Quick Diaper Log", fontWeight = FontWeight.SemiBold)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("Wet", "Dirty", "Both").forEach { diaperType ->
                OutlinedButton(
                    onClick = { /* Insert to Room DB */ },
                    modifier = Modifier.weight(1f)
                ) {
                    Text(diaperType)
                }
            }
        }
    }
}`,
  },
  {
    filename: 'Theme.kt',
    category: 'theme',
    description: 'Material 3 Warm Caramel ColorScheme (Caramel, Toffee, Dulce de Leche, Warm Cream) & Typography Tokens',
    code: `package com.maman.bebe.tracker.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Warm Caramel & Toffee Palette Tailored for Maternity Comfort & Gentle Elegance
val MamanCaramelPrimary = Color(0xFFBF8042)
val MamanCaramelContainer = Color(0xFFFDF8F3)
val MamanToffeeSecondary = Color(0xFFA96831)
val MamanToffeeContainer = Color(0xFFF8EDE0)
val MamanAmberTertiary = Color(0xFF8B5027)
val MamanAmberContainer = Color(0xFFF0DAC1)
val MamanBackgroundLight = Color(0xFFFAF5EE)
val MamanSurfaceLight = Color(0xFFFFFFFF)
val MamanSurfaceVariant = Color(0xFFF5EBE0)

private val LightColorScheme = lightColorScheme(
    primary = MamanCaramelPrimary,
    onPrimary = Color.White,
    primaryContainer = MamanCaramelContainer,
    onPrimaryContainer = Color(0xFF341B0E),
    secondary = MamanToffeeSecondary,
    onSecondary = Color.White,
    secondaryContainer = MamanToffeeContainer,
    onSecondaryContainer = Color(0xFF2E170A),
    tertiary = MamanAmberTertiary,
    onTertiary = Color.White,
    tertiaryContainer = MamanAmberContainer,
    onTertiaryContainer = Color(0xFF1E0E06),
    background = MamanBackgroundLight,
    surface = MamanSurfaceLight,
    surfaceVariant = MamanSurfaceVariant
)

@Composable
fun MamanBebeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme // Warm calming Caramel theme optimized for maternal care

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}`,
  },
  {
    filename: 'SampleDataGenerator.kt',
    category: 'sample_data',
    description: 'Kotlin Room database seeder: Populates initial sample due date, kick logs, feeds, and registry',
    code: `package com.maman.bebe.tracker.data.sample

import com.maman.bebe.tracker.data.local.MamanDatabase
import com.maman.bebe.tracker.data.local.entity.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.LocalDate

object SampleDataGenerator {

    suspend fun populateSampleData(database: MamanDatabase) = withContext(Dispatchers.IO) {
        val pregnancyDao = database.pregnancyDao()
        val babyLogDao = database.babyLogDao()

        // 1. Initial User Profile (24 weeks pregnant)
        val defaultProfile = BabyProfileEntity(
            motherName = "Camille",
            babyName = "Margot",
            isTwinMode = false,
            calculationMethod = "LMP",
            dueDate = LocalDate.now().plusWeeks(16).toString(),
            activeStage = "PREGNANCY"
        )
        pregnancyDao.upsertProfile(defaultProfile)

        // 2. Sample Completed Kick Counter Sessions
        val sampleKicks = listOf(
            KickSessionEntity(
                durationSeconds = 1240, // 20m 40s
                kickCount = 10,
                kickIntervalsCsv = "45,80,120,60,95,140,110,85,90,75",
                fetalStatus = "ACTIVE",
                notes = "Very active after evening warm milk"
            ),
            KickSessionEntity(
                durationSeconds = 1680, // 28m
                kickCount = 10,
                kickIntervalsCsv = "120,180,90,140,210,130,80,110,160,90",
                fetalStatus = "MODERATE",
                notes = "Felt kicks primarily on upper right side"
            )
        )
        sampleKicks.forEach { pregnancyDao.insertKickSession(it) }

        // 3. Sample Daily Maternal Health Logs
        val sampleDailyLogs = listOf(
            PregnancyLogEntity(
                date = LocalDate.now().minusDays(1).toString(),
                maternalWeightKg = 64.2f,
                symptomsCsv = "Heartburn:MILD,Round Ligament:MODERATE",
                mood = "Energetic",
                notes = "Walked 4,000 steps and drank 8 glasses of water"
            )
        )
        sampleDailyLogs.forEach { pregnancyDao.upsertDailyLog(it) }

        // 4. Sample Newborn Feedings & Diapers (For Newborn Mode)
        babyLogDao.insertFeeding(
            BabyFeedingLogEntity(
                feedType = "BREAST",
                leftDurationSeconds = 480,
                rightDurationSeconds = 600,
                notes = "Good deep latch on both sides"
            )
        )
        babyLogDao.insertDiaper(
            BabyDiaperLogEntity(
                diaperType = "BOTH",
                stoolColor = "YELLOW",
                consistency = "SEEDY",
                notes = "Normal healthy newborn diaper"
            )
        )
    }
}`,
  },
  {
    filename: 'LocaleHelper.kt',
    category: 'localization',
    description: 'Dynamic runtime language switcher supporting Android 13+ (Per-App Language Preferences) & legacy ContextWrapper',
    code: `package com.maman.bebe.tracker.util

import android.app.LocaleManager
import android.content.Context
import android.content.ContextWrapper
import android.content.res.Configuration
import android.os.Build
import android.os.LocaleList
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import java.util.Locale

/**
 * Clean Architecture utility managing dynamic runtime localization
 * Compatible with Android 13+ (API 33) Per-App Language Preferences
 * and backward-compatible with legacy ContextWrapper override.
 */
object LocaleHelper {

    private const val PREFS_NAME = "maman_bebe_prefs"
    private const val KEY_LANGUAGE = "selected_language"

    val SUPPORTED_LOCALES = listOf("en", "fr", "es", "de", "pt", "ar", "it", "ja")

    /**
     * Dynamic runtime language switch.
     * On Android 13+ (API 33), leverages system LocaleManager.
     * On API < 33, leverages AppCompatDelegate.setApplicationLocales().
     */
    fun setLocale(context: Context, languageCode: String): Context {
        persistLanguage(context, languageCode)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.getSystemService(LocaleManager::class.java)?.applicationLocales =
                LocaleList(Locale.forLanguageTag(languageCode))
            return context
        } else {
            // AndroidX Per-App Language Preferences backward compatibility
            val appLocale = LocaleListCompat.forLanguageTags(languageCode)
            AppCompatDelegate.setApplicationLocales(appLocale)
            return updateResources(context, languageCode)
        }
    }

    /**
     * Called in Application.attachBaseContext() and Activity.attachBaseContext()
     */
    fun onAttach(context: Context): ContextWrapper {
        val lang = getPersistedLanguage(context, Locale.getDefault().language)
        return updateResources(context, lang)
    }

    private fun persistLanguage(context: Context, language: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_LANGUAGE, language).apply()
    }

    fun getPersistedLanguage(context: Context, defaultLanguage: String = "en"): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val saved = prefs.getString(KEY_LANGUAGE, defaultLanguage) ?: defaultLanguage
        return if (saved in SUPPORTED_LOCALES) saved else "en"
    }

    private fun updateResources(context: Context, language: String): ContextWrapper {
        val locale = Locale.forLanguageTag(language)
        Locale.setDefault(locale)

        val configuration = Configuration(context.resources.configuration)
        configuration.setLocale(locale)
        configuration.setLayoutDirection(locale)

        val updatedContext = context.createConfigurationContext(configuration)
        return ContextWrapper(updatedContext)
    }

    fun isRtl(languageCode: String): Boolean = languageCode == "ar"
}`,
  },
  {
    filename: 'strings.xml',
    category: 'localization',
    description: 'Default English (res/values/strings.xml) - Complete UI string resources & formatters',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Maman &amp; bébé</string>
    <string name="medical_disclaimer">Medical Notice: For informational purposes only; not a substitute for professional medical advice, diagnosis, or treatment.</string>
    <string name="safety_guidelines">Safety Guidelines</string>
    
    <!-- Navigation Tabs -->
    <string name="tab_pregnancy">Pregnancy</string>
    <string name="tab_logger">Logger</string>
    <string name="tab_baby_log">Baby Log</string>
    <string name="tab_planning">Planning</string>
    <string name="tab_guides">Guides</string>
    
    <!-- Pregnancy Counters -->
    <string name="week_format">Week %1$d, Day %2$d</string>
    <string name="days_remaining_format">%1$d days to go</string>
    <string name="due_date_format">Due: %1$s</string>
    <string name="twin_mode">Twin Mode</string>
    <string name="single_mode">Single Baby</string>
    
    <!-- Kick Counter -->
    <string name="kick_counter_title">Standard Fetal Kick Counter</string>
    <string name="kick_goal_label">Goal: 10 Movements</string>
    <string name="tap_to_kick">Tap to Kick</string>
    <string name="goal_reached">10 Kicks Met!</string>
    <string name="kicks_remaining">%1$d to target</string>
    <string name="start_session">Start Session</string>
    <string name="pause">Pause</string>
    <string name="resume">Resume</string>
    <string name="reset">Reset</string>
    <string name="save_kick_session">Save Kick Session to Record</string>
    
    <!-- Baby Logger -->
    <string name="breastfeeding_timer">Breastfeeding Live Timer</string>
    <string name="left_breast">Left Breast</string>
    <string name="right_breast">Right Breast</string>
    <string name="bottle_feeding">Bottle Feeding Logger</string>
    <string name="expressed_milk">Expressed Milk</string>
    <string name="formula_milk">Formula Bottle</string>
    <string name="diaper_wet">Wet Diaper</string>
    <string name="diaper_dirty">Dirty Diaper</string>
    <string name="diaper_both">Both</string>
    <string name="sleep_nap">Nap</string>
    <string name="sleep_night">Night Sleep</string>
    
    <!-- Settings & i18n -->
    <string name="settings_title">Pregnancy &amp; Baby Setup</string>
    <string name="language_selection">App Language &amp; Localization</string>
    <string name="unit_system">Unit System</string>
    <string name="unit_metric">Metric (kg, cm, ml)</string>
    <string name="unit_imperial">Imperial (lbs, in, oz)</string>
</resources>`,
  },
  {
    filename: 'strings-fr.xml',
    category: 'localization',
    description: 'French Localization (res/values-fr/strings.xml) - Complete localized resources',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Maman &amp; bébé</string>
    <string name="medical_disclaimer">Avis Médical : À titre informatif uniquement ; ne remplace pas un avis, diagnostic ou traitement médical professionnel.</string>
    <string name="safety_guidelines">Consignes de sécurité</string>
    
    <!-- Navigation Tabs -->
    <string name="tab_pregnancy">Grossesse</string>
    <string name="tab_logger">Journal</string>
    <string name="tab_baby_log">Bébé</string>
    <string name="tab_planning">Outils</string>
    <string name="tab_guides">Guides</string>
    
    <!-- Pregnancy Counters -->
    <string name="week_format">Semaine %1$d, Jour %2$d</string>
    <string name="days_remaining_format">%1$d jours restants</string>
    <string name="due_date_format">Prévu le : %1$s</string>
    <string name="twin_mode">Mode Jumeaux</string>
    <string name="single_mode">Bébé Unique</string>
    
    <!-- Kick Counter -->
    <string name="kick_counter_title">Compteur de mouvements fœtaux</string>
    <string name="kick_goal_label">Objectif : 10 mouvements</string>
    <string name="tap_to_kick">Toucher pour compter</string>
    <string name="goal_reached">10 mouvements atteints !</string>
    <string name="kicks_remaining">%1$d restants</string>
    <string name="start_session">Démarrer</string>
    <string name="pause">Pause</string>
    <string name="resume">Reprendre</string>
    <string name="reset">Réinitialiser</string>
    <string name="save_kick_session">Enregistrer la séance</string>
    
    <!-- Baby Logger -->
    <string name="breastfeeding_timer">Minuteur Allaitement en direct</string>
    <string name="left_breast">Sein Gauche</string>
    <string name="right_breast">Sein Droit</string>
    <string name="bottle_feeding">Enregistrer Biberon</string>
    <string name="expressed_milk">Lait maternel exprimé</string>
    <string name="formula_milk">Biberon préparation</string>
    <string name="diaper_wet">Mouillée</string>
    <string name="diaper_dirty">Selle</string>
    <string name="diaper_both">Les deux</string>
    <string name="sleep_nap">Sieste</string>
    <string name="sleep_night">Nuit</string>
    
    <!-- Settings & i18n -->
    <string name="settings_title">Configuration Maman &amp; bébé</string>
    <string name="language_selection">Langue de l’application</string>
    <string name="unit_system">Système d’unités</string>
    <string name="unit_metric">Métrique (kg, cm, ml)</string>
    <string name="unit_imperial">Impérial (lbs, in, oz)</string>
</resources>`,
  },
  {
    filename: 'strings-ar.xml',
    category: 'localization',
    description: 'Arabic Localization (res/values-ar/strings.xml) - Complete localized resources with RTL support',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">مامان وبيبي</string>
    <string name="medical_disclaimer">إشعار طبي: لأغراض إعلامية فقط؛ لا يعتبر بديلاً عن الاستشارة أو التشخيص الطبي المتخصص.</string>
    <string name="safety_guidelines">إرشادات السلامة</string>
    
    <!-- Navigation Tabs -->
    <string name="tab_pregnancy">الحمل</string>
    <string name="tab_logger">السجل</string>
    <string name="tab_baby_log">الطفل</string>
    <string name="tab_planning">التخطيط</string>
    <string name="tab_guides">الدلائل</string>
    
    <!-- Pregnancy Counters -->
    <string name="week_format">الأسبوع %1$d، اليوم %2$d</string>
    <string name="days_remaining_format">%1$d يوم متبقي</string>
    <string name="due_date_format">الموعد المتوقع: %1$s</string>
    <string name="twin_mode">وضع التوأم</string>
    <string name="single_mode">طفل واحد</string>
    
    <!-- Kick Counter -->
    <string name="kick_counter_title">عداد حركات وركلات الجنين</string>
    <string name="kick_goal_label">الهدف: 10 حركات</string>
    <string name="tap_to_kick">اضغط لتسجيل الركلة</string>
    <string name="goal_reached">تم إكمال 10 ركلات!</string>
    <string name="kicks_remaining">%1$d حركات متبقية</string>
    <string name="start_session">بدء الجلسة</string>
    <string name="pause">إيقاف مؤقت</string>
    <string name="resume">متابعة</string>
    <string name="reset">إعادة ضبط</string>
    <string name="save_kick_session">حفظ جلسة الركلات</string>
    
    <!-- Baby Logger -->
    <string name="breastfeeding_timer">مؤقت الرضاعة الطبيعية المباشر</string>
    <string name="left_breast">الثدي الأيسر</string>
    <string name="right_breast">الثدي الأيمن</string>
    <string name="bottle_feeding">سجل الزجاجة</string>
    <string name="expressed_milk">حليب طبيعي مشفوط</string>
    <string name="formula_milk">حليب صناعي</string>
    <string name="diaper_wet">مبلل</string>
    <string name="diaper_dirty">براز</string>
    <string name="diaper_both">كلاهما</string>
    <string name="sleep_nap">قيلولة</string>
    <string name="sleep_night">نوم ليلي</string>
    
    <!-- Settings & i18n -->
    <string name="settings_title">إعدادات مامان وبيبي</string>
    <string name="language_selection">لغة التطبيق</string>
    <string name="unit_system">نظام القياس</string>
    <string name="unit_metric">متري (كجم، سم، مل)</string>
    <string name="unit_imperial">إمبراطوري (باوند، بوصة، أونصة)</string>
</resources>`,
  },
  {
    filename: 'locales_config.xml',
    category: 'localization',
    description: 'Android 13+ Per-App Language Preferences configuration (res/xml/locales_config.xml)',
    code: `<?xml version="1.0" encoding="utf-8"?>
<locale-config xmlns:android="http://schemas.android.com/apk/res/android">
    <locale android:name="en"/>
    <locale android:name="fr"/>
    <locale android:name="es"/>
    <locale android:name="de"/>
    <locale android:name="pt"/>
    <locale android:name="ar"/>
    <locale android:name="it"/>
    <locale android:name="ja"/>
</locale-config>`,
  },
  {
    filename: 'GeminiAssistantService.kt',
    category: 'ai_assistant',
    description: 'Android Gemini Service for supportive, non-medical parenting guidance with week/baby age context',
    code: `package com.maman.bebe.tracker.ai

import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

data class AssistantContext(
    val stage: String, // "pregnancy" or "baby"
    val week: Int,
    val babyAge: String,
    val isTwin: boolean,
    val motherName: String,
    val babyName: String,
    val babyNameTwin: String?,
    val languageCode: String
)

@Singleton
class GeminiAssistantService @Inject constructor() {

    // Using Gemini 3.8 Flash for fast, warm conversational parenting guidance
    private val generativeModel = GenerativeModel(
        modelName = "gemini-3.8-flash",
        apiKey = BuildConfig.GEMINI_API_KEY
    )

    suspend fun sendGuidancePrompt(
        userMessage: String,
        context: AssistantContext,
        chatHistory: List<Pair<String, String>> = emptyList()
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val systemInstruction = """
                You are "Maman Assistant", a warm, empathetic, and knowledgeable parenting companion for expectant mothers and new parents in the Maman & bébé app.
                
                Current Context:
                - Mother: \${context.motherName}
                - Stage: \${context.stage} (Week \${context.week} or Baby Age \${context.babyAge})
                - Children: \${if (context.isTwin) "\${context.babyName} & \${context.babyNameTwin}" else context.babyName}
                - Language: \${context.languageCode}
                
                MANDATORY NON-MEDICAL SAFETY BOUNDARY:
                - You offer supportive comfort, routine suggestions, soothing techniques, and evidence-based developmental facts.
                - You NEVER provide medical diagnoses, treatment plans, or medication changes.
                - For acute symptoms (vaginal bleeding, fever, vision changes, reduced kicks, infant distress), immediately urge the mother to contact her OB-GYN, pediatrician, or emergency care.
            """.trimIndent()

            val prompt = content {
                text(systemInstruction)
                chatHistory.forEach { (role, msg) ->
                    text("\$role: \$msg")
                }
                text("User: \$userMessage")
            }

            val response = generativeModel.generateContent(prompt)
            val reply = response.text ?: "I am here for you, mama. How can I support your day?"
            Result.success(reply)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}`,
  },
  {
    filename: 'MamanAssistantScreen.kt',
    category: 'ai_assistant',
    description: 'Jetpack Compose Material 3 chat screen with contextual chips, typing state, and safety notice',
    code: `package com.maman.bebe.tracker.ui.assistant

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Sparkles
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.maman.bebe.tracker.R

data class ChatMessage(val id: String, val isUser: Boolean, val text: String, val timestamp: Long)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MamanAssistantScreen(
    currentWeek: Int,
    isTwin: Boolean,
    onBack: () -> Unit
) {
    var inputText by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    val messages = remember { mutableStateListOf<ChatMessage>() }
    val listState = rememberLazyListState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(text = "Maman Assistant", style = MaterialTheme.typography.titleMedium)
                        Text(
                            text = "Week \$currentWeek \${if (isTwin) "· Twin Journey" else ""} · Non-Medical Doula",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Safety Disclaimer Banner
            Surface(
                color = MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.5f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Outlined.Info, contentDescription = null, tint = MaterialTheme.colorScheme.tertiary)
                    Text(
                        text = stringResource(R.string.medical_disclaimer),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onTertiaryContainer
                    )
                }
            }

            // Message Stream
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(messages) { msg ->
                    ChatBubble(message = msg)
                }
            }

            // Input Bar
            Surface(
                tonalElevation = 3.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                        .fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    TextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = { Text("Ask about Week \$currentWeek routines...") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(24.dp)
                    )
                    IconButton(
                        onClick = {
                            if (inputText.isNotBlank()) {
                                messages.add(ChatMessage(id = "\${System.currentTimeMillis()}", isUser = true, text = inputText, timestamp = System.currentTimeMillis()))
                                inputText = ""
                            }
                        }
                    ) {
                        Icon(Icons.Filled.Send, contentDescription = "Send", tint = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

@Composable
fun ChatBubble(message: ChatMessage) {
    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = if (message.isUser) Alignment.CenterEnd else Alignment.CenterStart
    ) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = if (message.isUser) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Text(
                text = message.text,
                modifier = Modifier.padding(12.dp),
                style = MaterialTheme.typography.bodyMedium,
                color = if (message.isUser) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}`,
  },
  {
    filename: 'BumpGuideCameraScreen.kt',
    category: 'camera_photos',
    description: 'CameraX integration with live viewfinder, optional Bump Silhouette Guide & Rule-of-Thirds Grid overlays, and high-res capture',
    code: `package com.maman.bebe.tracker.presentation.photos

import android.content.Context
import android.net.Uri
import android.view.ViewGroup
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCancellableCoroutine

/**
 * CameraX Screen with pregnancy bump guide silhouette and alignment grid.
 * Ensures consistent angle and framing across weekly bump progression photos.
 */
@Composable
fun BumpGuideCameraScreen(
    currentWeek: Int,
    onPhotoCaptured: (Uri, Int) -> Unit,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var lensFacing by remember { mutableStateOf(CameraSelector.LENS_FACING_BACK) }
    var showGuide by remember { mutableStateOf(true) }
    var showGrid by remember { mutableStateOf(true) }
    var guideOpacity by remember { mutableFloatStateOf(0.65f) }
    var flashMode by remember { mutableIntStateOf(ImageCapture.FLASH_MODE_OFF) }

    val imageCapture = remember {
        ImageCapture.Builder()
            .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
            .setFlashMode(flashMode)
            .build()
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        // Camera Preview
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                val previewView = PreviewView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    scaleType = PreviewView.ScaleType.FILL_CENTER
                }

                val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                cameraProviderFuture.addListener({
                    val cameraProvider = cameraProviderFuture.get()
                    val preview = Preview.Builder().build().also {
                        it.setSurfaceProvider(previewView.surfaceProvider)
                    }

                    val cameraSelector = CameraSelector.Builder()
                        .requireLensFacing(lensFacing)
                        .build()

                    try {
                        cameraProvider.unbindAll()
                        cameraProvider.bindToLifecycle(
                            lifecycleOwner,
                            cameraSelector,
                            preview,
                            imageCapture
                        )
                    } catch (exc: Exception) {
                        exc.printStackTrace()
                    }
                }, ContextCompat.getMainExecutor(ctx))

                previewView
            }
        )

        // Overlay: Rule-of-Thirds Grid
        if (showGrid) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val stroke = Stroke(width = 1.dp.toPx(), pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f))
                val color = Color.White.copy(alpha = 0.35f)

                // Vertical grid lines
                val colWidth = size.width / 3f
                drawLine(color, Offset(colWidth, 0f), Offset(colWidth, size.height), stroke.width)
                drawLine(color, Offset(colWidth * 2, 0f), Offset(colWidth * 2, size.height), stroke.width)

                // Horizontal grid lines
                val rowHeight = size.height / 3f
                drawLine(color, Offset(0f, rowHeight), Offset(size.width, rowHeight), stroke.width)
                drawLine(color, Offset(0f, rowHeight * 2), Offset(size.width, rowHeight * 2), stroke.width)
            }
        }

        // Overlay: Bump Silhouette & Alignment Curve Guide
        if (showGuide) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val guideColor = Color(0xFFBF8042).copy(alpha = guideOpacity)
                val accentColor = Color.White.copy(alpha = guideOpacity * 0.8f)

                val centerX = size.width / 2f
                val centerY = size.height / 2f

                // Outer belly profile contour curve
                val bellyPath = Path().apply {
                    moveTo(centerX - 40.dp.toPx(), centerY - 140.dp.toPx())
                    cubicTo(
                        centerX + 60.dp.toPx(), centerY - 80.dp.toPx(),
                        centerX + 120.dp.toPx(), centerY,
                        centerX + 110.dp.toPx(), centerY + 80.dp.toPx()
                    )
                    cubicTo(
                        centerX + 90.dp.toPx(), centerY + 130.dp.toPx(),
                        centerX + 20.dp.toPx(), centerY + 180.dp.toPx(),
                        centerX - 30.dp.toPx(), centerY + 200.dp.toPx()
                    )
                }

                drawPath(
                    path = bellyPath,
                    color = guideColor,
                    style = Stroke(width = 3.5.dp.toPx())
                )

                // Center alignment marker for belly apex
                drawCircle(
                    color = guideColor,
                    radius = 8.dp.toPx(),
                    center = Offset(centerX + 115.dp.toPx(), centerY + 40.dp.toPx())
                )
                drawCircle(
                    color = accentColor,
                    radius = 3.dp.toPx(),
                    center = Offset(centerX + 115.dp.toPx(), centerY + 40.dp.toPx())
                )
            }
        }

        // Top Toolbar (Controls for Guide, Grid, Flash, Flip)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier.background(Color.Black.copy(alpha = 0.5f), CircleShape)
            ) {
                Icon(Icons.Filled.Close, contentDescription = "Close", tint = Color.White)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                // Flash toggle
                IconButton(
                    onClick = {
                        flashMode = when (flashMode) {
                            ImageCapture.FLASH_MODE_OFF -> ImageCapture.FLASH_MODE_ON
                            ImageCapture.FLASH_MODE_ON -> ImageCapture.FLASH_MODE_AUTO
                            else -> ImageCapture.FLASH_MODE_OFF
                        }
                        imageCapture.flashMode = flashMode
                    },
                    modifier = Modifier.background(Color.Black.copy(alpha = 0.5f), CircleShape)
                ) {
                    Icon(
                        imageVector = if (flashMode == ImageCapture.FLASH_MODE_ON) Icons.Filled.FlashOn else Icons.Filled.FlashOff,
                        contentDescription = "Flash",
                        tint = if (flashMode == ImageCapture.FLASH_MODE_ON) Color(0xFFFFC107) else Color.White
                    )
                }

                // Grid toggle
                FilterChip(
                    selected = showGrid,
                    onClick = { showGrid = !showGrid },
                    label = { Text("Grid", color = Color.White) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.primary,
                        containerColor = Color.Black.copy(alpha = 0.5f)
                    )
                )

                // Bump Guide toggle
                FilterChip(
                    selected = showGuide,
                    onClick = { showGuide = !showGuide },
                    label = { Text("Bump Guide", color = Color.White) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFFBF8042),
                        containerColor = Color.Black.copy(alpha = 0.5f)
                    )
                )
            }
        }

        // Bottom Capture Controls
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Week $currentWeek Milestone Bump",
                style = MaterialTheme.typography.labelLarge,
                color = Color.White.copy(alpha = 0.85f),
                modifier = Modifier.padding(bottom = 16.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 32.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Flip camera
                IconButton(
                    onClick = {
                        lensFacing = if (lensFacing == CameraSelector.LENS_FACING_BACK) {
                            CameraSelector.LENS_FACING_FRONT
                        } else {
                            CameraSelector.LENS_FACING_BACK
                        }
                    },
                    modifier = Modifier.background(Color.Black.copy(alpha = 0.5f), CircleShape)
                ) {
                    Icon(Icons.Filled.FlipCameraAndroid, contentDescription = "Flip", tint = Color.White)
                }

                // Shutter button
                Button(
                    onClick = {
                        captureHighResPhoto(context, imageCapture) { uri ->
                            onPhotoCaptured(uri, currentWeek)
                        }
                    },
                    modifier = Modifier
                        .size(80.dp)
                        .border(4.dp, Color.White, CircleShape),
                    shape = CircleShape,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFBF8042))
                ) {
                    Icon(Icons.Filled.CameraAlt, contentDescription = "Capture", tint = Color.White, modifier = Modifier.size(36.dp))
                }

                Spacer(modifier = Modifier.size(48.dp))
            }
        }
    }
}

private fun captureHighResPhoto(
    context: Context,
    imageCapture: ImageCapture,
    onSuccess: (Uri) -> Unit
) {
    val photoFile = File(
        context.cacheDir,
        "bump_capture_\${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())}.jpg"
    )

    val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

    imageCapture.takePicture(
        outputOptions,
        ContextCompat.getMainExecutor(context),
        object : ImageCapture.OnImageSavedCallback {
            override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
                onSuccess(Uri.fromFile(photoFile))
            }

            override fun onError(exception: ImageCaptureException) {
                exception.printStackTrace()
            }
        }
    )
}`,
  },
  {
    filename: 'MilestonePhotoEntity.kt',
    category: 'room',
    description: 'Room Database Entity, DAO, and Local Storage Repository for organizing milestone photos by pregnancy week',
    code: `package com.maman.bebe.tracker.data.local

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.room.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

/**
 * Room Entity representing a milestone photo (Bump, Ultrasound, Nursery).
 * Stored safely in local private app internal storage.
 */
@Entity(tableName = "milestone_photos")
data class MilestonePhotoEntity(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val weekNumber: Int,
    val captureDate: Long = System.currentTimeMillis(),
    val localFilePath: String, // Path in context.filesDir/milestones/
    val photoType: String = "BUMP", // BUMP, ULTRASOUND, NURSERY, CELEBRATION
    val notes: String? = null,
    val filterApplied: String = "NONE", // NONE, CARAMEL, ROSE, VINTAGE, BW
    val textOverlay: String? = null,
    val aspectRatio: String = "4:5",
    val tagsCsv: String = ""
)

@Dao
interface MilestonePhotoDao {
    @Query("SELECT * FROM milestone_photos ORDER BY weekNumber ASC, captureDate DESC")
    fun getAllPhotos(): Flow<List<MilestonePhotoEntity>>

    @Query("SELECT * FROM milestone_photos WHERE weekNumber = :week ORDER BY captureDate DESC")
    fun getPhotosForWeek(week: Int): Flow<List<MilestonePhotoEntity>>

    @Query("SELECT DISTINCT weekNumber FROM milestone_photos ORDER BY weekNumber ASC")
    fun getRecordedWeeks(): Flow<List<Int>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPhoto(photo: MilestonePhotoEntity)

    @Update
    suspend fun updatePhoto(photo: MilestonePhotoEntity)

    @Delete
    suspend fun deletePhoto(photo: MilestonePhotoEntity)

    @Query("DELETE FROM milestone_photos WHERE id = :photoId")
    suspend fun deleteById(photoId: String)
}

/**
 * Storage Helper to manage copying captured photos to private internal app storage,
 * complying with Scoped Storage without requiring broad storage runtime permissions.
 */
class LocalMilestonePhotoRepository(
    private val context: Context,
    private val photoDao: MilestonePhotoDao
) {
    val allPhotos: Flow<List<MilestonePhotoEntity>> = photoDao.getAllPhotos()
    val recordedWeeks: Flow<List<Int>> = photoDao.getRecordedWeeks()

    fun getPhotosForWeek(week: Int): Flow<List<MilestonePhotoEntity>> =
        photoDao.getPhotosForWeek(week)

    suspend fun savePhoto(
        tempUri: Uri,
        weekNumber: Int,
        photoType: String,
        notes: String?,
        filterApplied: String,
        textOverlay: String?,
        aspectRatio: String
    ): MilestonePhotoEntity = withContext(Dispatchers.IO) {
        val milestoneDir = File(context.filesDir, "milestone_photos").apply {
            if (!exists()) mkdirs()
        }

        val filename = "week_\${weekNumber}_\${System.currentTimeMillis()}.jpg"
        val destinationFile = File(milestoneDir, filename)

        // Copy from temp/camera uri to private internal storage
        context.contentResolver.openInputStream(tempUri)?.use { input ->
            FileOutputStream(destinationFile).use { output ->
                input.copyTo(output)
            }
        }

        val entity = MilestonePhotoEntity(
            weekNumber = weekNumber,
            localFilePath = destinationFile.absolutePath,
            photoType = photoType,
            notes = notes,
            filterApplied = filterApplied,
            textOverlay = textOverlay,
            aspectRatio = aspectRatio,
            tagsCsv = "Week $weekNumber, $photoType"
        )

        photoDao.insertPhoto(entity)
        entity
    }

    suspend fun deletePhoto(photo: MilestonePhotoEntity) = withContext(Dispatchers.IO) {
        // Remove file from disk
        val file = File(photo.localFilePath)
        if (file.exists()) {
            file.delete()
        }
        photoDao.deletePhoto(photo)
    }
}`,
  },
  {
    filename: 'MilestonePhotoEditorScreen.kt',
    category: 'compose_ui',
    description: 'Photo Editor component with Aspect Ratio cropping (1:1, 4:5, 9:16), ColorMatrix filters, and customizable milestone text overlay badges',
    code: `package com.maman.bebe.tracker.presentation.photos

import android.content.Context
import android.graphics.*
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

enum class AspectRatioPreset(val label: String, val ratio: Float) {
    SQUARE("1:1", 1f),
    PORTRAIT("4:5", 4f / 5f),
    STORY("9:16", 9f / 16f)
}

enum class ColorFilterType(val label: String) {
    NONE("Original"),
    CARAMEL("Caramel Glow"),
    ROSE("Rosy Warmth"),
    VINTAGE("Vintage Sepia"),
    BW("B&W Film")
}

/**
 * Milestone Photo Editor with Crop Ratios, ColorMatrix Filters, and Milestone Text Overlay.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MilestonePhotoEditorScreen(
    sourceUri: Uri,
    initialWeek: Int,
    onSaveSuccess: (Uri) -> Unit,
    onCancel: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var selectedRatio by remember { mutableStateOf(AspectRatioPreset.PORTRAIT) }
    var selectedFilter by remember { mutableStateOf(ColorFilterType.CARAMEL) }
    var textOverlay by remember { mutableStateOf("Week $initialWeek ✨ Baby Bump") }
    var showBadge by remember { mutableStateOf(true) }
    var notes by remember { mutableStateOf("") }
    var isExporting by remember { mutableStateOf(false) }

    // Load source bitmap
    var bitmap by remember { mutableStateOf<Bitmap?>(null) }

    LaunchedEffect(sourceUri) {
        withContext(Dispatchers.IO) {
            context.contentResolver.openInputStream(sourceUri)?.use { stream ->
                bitmap = BitmapFactory.decodeStream(stream)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit Milestone Photo", style = MaterialTheme.typography.titleMedium) },
                navigationIcon = {
                    IconButton(onClick = onCancel) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    Button(
                        onClick = {
                            bitmap?.let { b ->
                                isExporting = true
                                coroutineScope.launch {
                                    val editedUri = exportRenderedBitmap(
                                        context = context,
                                        baseBitmap = b,
                                        ratio = selectedRatio,
                                        filter = selectedFilter,
                                        textBadge = if (showBadge) textOverlay else null
                                    )
                                    isExporting = false
                                    onSaveSuccess(editedUri)
                                }
                            }
                        },
                        enabled = !isExporting && bitmap != null,
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        if (isExporting) {
                            CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White)
                        } else {
                            Text("Save")
                        }
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Live Preview Canvas Container
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .background(Color(0xFF1C1917))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                bitmap?.let { bmp ->
                    Box(
                        modifier = Modifier
                            .aspectRatio(selectedRatio.ratio)
                            .fillMaxHeight(0.85f)
                            .clip(RoundedCornerShape(16.dp))
                    ) {
                        // Image with Compose ColorMatrix filter
                        Image(
                            bitmap = bmp.asImageBitmap(),
                            contentDescription = "Edited Preview",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop,
                            colorFilter = getColorFilter(selectedFilter)
                        )

                        // Text Badge Overlay
                        if (showBadge && textOverlay.isNotEmpty()) {
                            Surface(
                                modifier = Modifier
                                    .align(Alignment.BottomCenter)
                                    .padding(bottom = 20.dp),
                                shape = RoundedCornerShape(24.dp),
                                color = Color.Black.copy(alpha = 0.8f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.2f))
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = textOverlay,
                                        color = Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                } ?: CircularProgressIndicator(color = Color(0xFFBF8042))
            }

            // Editor Controls Tabs
            Surface(
                modifier = Modifier.fillMaxWidth(),
                tonalElevation = 4.dp,
                shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Aspect Ratio Presets
                    Text("Aspect Ratio", style = MaterialTheme.typography.labelMedium)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        AspectRatioPreset.values().forEach { preset ->
                            FilterChip(
                                selected = selectedRatio == preset,
                                onClick = { selectedRatio = preset },
                                label = { Text(preset.label) }
                            )
                        }
                    }

                    // Color Filters
                    Text("Filter Preset", style = MaterialTheme.typography.labelMedium)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        ColorFilterType.values().forEach { f ->
                            FilterChip(
                                selected = selectedFilter == f,
                                onClick = { selectedFilter = f },
                                label = { Text(f.label) }
                            )
                        }
                    }

                    // Milestone Text Overlay
                    OutlinedTextField(
                        value = textOverlay,
                        onValueChange = { textOverlay = it },
                        label = { Text("Milestone Badge Text") },
                        modifier = Modifier.fillMaxWidth(),
                        trailingIcon = {
                            IconButton(onClick = { showBadge = !showBadge }) {
                                Icon(if (showBadge) Icons.Filled.Visibility else Icons.Filled.VisibilityOff, null)
                            }
                        }
                    )
                }
            }
        }
    }
}

fun getColorFilter(filter: ColorFilterType): ColorFilter? = when (filter) {
    ColorFilterType.NONE -> null
    ColorFilterType.CARAMEL -> ColorFilter.colorMatrix(
        ColorMatrix(floatArrayOf(
            1.15f, 0f, 0f, 0f, 20f,
            0f, 1.05f, 0f, 0f, 10f,
            0f, 0f, 0.9f, 0f, 0f,
            0f, 0f, 0f, 1f, 0f
        ))
    )
    ColorFilterType.ROSE -> ColorFilter.colorMatrix(
        ColorMatrix(floatArrayOf(
            1.2f, 0f, 0f, 0f, 25f,
            0f, 1.0f, 0f, 0f, 10f,
            0f, 0f, 1.05f, 0f, 15f,
            0f, 0f, 0f, 1f, 0f
        ))
    )
    ColorFilterType.VINTAGE -> ColorFilter.colorMatrix(
        ColorMatrix(floatArrayOf(
            0.9f, 0f, 0f, 0f, 15f,
            0f, 0.85f, 0f, 0f, 15f,
            0f, 0f, 0.75f, 0f, 10f,
            0f, 0f, 0f, 1f, 0f
        ))
    )
    ColorFilterType.BW -> ColorFilter.colorMatrix(ColorMatrix().apply { setToSaturation(0f) })
}

private suspend fun exportRenderedBitmap(
    context: Context,
    baseBitmap: Bitmap,
    ratio: AspectRatioPreset,
    filter: ColorFilterType,
    textBadge: String?
): Uri = withContext(Dispatchers.IO) {
    val targetWidth = 1200
    val targetHeight = (targetWidth / ratio.ratio).toInt()

    val resultBitmap = Bitmap.createBitmap(targetWidth, targetHeight, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(resultBitmap)

    // Draw Cropped Base
    val srcRatio = baseBitmap.width.toFloat() / baseBitmap.height.toFloat()
    val dstRatio = targetWidth.toFloat() / targetHeight.toFloat()

    val srcRect = if (srcRatio > dstRatio) {
        val newWidth = (baseBitmap.height * dstRatio).toInt()
        val left = (baseBitmap.width - newWidth) / 2
        Rect(left, 0, left + newWidth, baseBitmap.height)
    } else {
        val newHeight = (baseBitmap.width / dstRatio).toInt()
        val top = (baseBitmap.height - newHeight) / 2
        Rect(0, top, baseBitmap.width, top + newHeight)
    }

    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        if (filter == ColorFilterType.BW) {
            val cm = android.graphics.ColorMatrix()
            cm.setSaturation(0f)
            colorFilter = ColorMatrixColorFilter(cm)
        }
    }

    canvas.drawBitmap(baseBitmap, srcRect, Rect(0, 0, targetWidth, targetHeight), paint)

    // Render Text Badge
    textBadge?.let { text ->
        val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = android.graphics.Color.WHITE
            textSize = 42f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            textAlign = Paint.Align.CENTER
        }

        val textWidth = textPaint.measureText(text)
        val badgeHeight = 90f
        val badgeWidth = textWidth + 80f
        val badgeLeft = (targetWidth - badgeWidth) / 2f
        val badgeTop = targetHeight - 160f

        val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = android.graphics.Color.argb(210, 28, 25, 23)
        }

        val badgeRect = RectF(badgeLeft, badgeTop, badgeLeft + badgeWidth, badgeTop + badgeHeight)
        canvas.drawRoundRect(badgeRect, 45f, 45f, bgPaint)
        canvas.drawText(text, targetWidth / 2f, badgeTop + 58f, textPaint)
    }

    val outputFile = File(context.cacheDir, "edited_bump_\${System.currentTimeMillis()}.jpg")
    FileOutputStream(outputFile).use { out ->
        resultBitmap.compress(Bitmap.CompressFormat.JPEG, 92, out)
    }

    Uri.fromFile(outputFile)
}`,
  },
  {
    filename: 'NativeShareHelper.kt',
    category: 'manifest',
    description: 'Native Android Sharesheet integration using FileProvider for Instagram Stories, WhatsApp, and messaging apps',
    code: `package com.maman.bebe.tracker.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File

/**
 * Native Android Sharing Helper.
 * Prepares FileProvider content URI to grant temporary read permissions
 * across sandboxes to messaging apps, social networks, and Instagram Stories.
 */
object NativeShareHelper {

    /**
     * Standard Android ShareSheet with image and custom pregnancy milestone caption.
     */
    fun shareMilestonePhoto(
        context: Context,
        filePath: String,
        weekNumber: Int,
        babyName: String = "Baby",
        customNote: String? = null
    ) {
        val imageFile = File(filePath)
        if (!imageFile.exists()) return

        // Generate content:// URI via FileProvider
        val contentUri: Uri = FileProvider.getUriForFile(
            context,
            "\${context.packageName}.fileprovider",
            imageFile
        )

        val caption = buildString {
            append("Week $weekNumber Milestone with $babyName! 💕 ")
            if (!customNote.isNullOrBlank()) {
                append("\n\"$customNote\"")
            }
            append("\n#MamanBebe #PregnancyJourney #Week$weekNumber")
        }

        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "image/jpeg"
            putExtra(Intent.EXTRA_STREAM, contentUri)
            putExtra(Intent.EXTRA_TEXT, caption)
            putExtra(Intent.EXTRA_SUBJECT, "Week $weekNumber Bump Milestone")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }

        val chooser = Intent.createChooser(shareIntent, "Share Milestone Photo")
        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(chooser)
    }

    /**
     * Direct Instagram Stories Share Intent.
     * Passes the milestone image directly into the Instagram story compositor.
     */
    fun shareToInstagramStory(
        context: Context,
        filePath: String
    ) {
        val imageFile = File(filePath)
        if (!imageFile.exists()) return

        val contentUri: Uri = FileProvider.getUriForFile(
            context,
            "\${context.packageName}.fileprovider",
            imageFile
        )

        val storyIntent = Intent("com.instagram.share.ADD_TO_STORY").apply {
            setDataAndType(contentUri, "image/jpeg")
            flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
            putExtra("top_background_color", "#BF8042")
            putExtra("bottom_background_color", "#FAF5EE")
        }

        if (context.packageManager.resolveActivity(storyIntent, 0) != null) {
            context.startActivity(storyIntent)
        } else {
            // Fallback to standard chooser
            shareMilestonePhoto(context, filePath, weekNumber = 0)
        }
    }
}

/*
 * =========================================================================
 * Required AndroidManifest.xml Provider Declaration:
 * =========================================================================
 * <provider
 *     android:name="androidx.core.content.FileProvider"
 *     android:authorities="\${applicationId}.fileprovider"
 *     android:exported="false"
 *     android:grantUriPermissions="true">
 *     <meta-data
 *         android:name="android.support.FILE_PROVIDER_PATHS"
 *         android:resource="@xml/file_paths" />
 * </provider>
 *
 * =========================================================================
 * res/xml/file_paths.xml:
 * =========================================================================
 * <?xml version="1.0" encoding="utf-8"?>
 * <paths xmlns:android="http://schemas.android.com/apk/res/android">
 *     <files-path name="milestone_photos" path="milestone_photos/" />
 *     <cache-path name="shared_photos" path="." />
 * </paths>
 */`,
  },
];
