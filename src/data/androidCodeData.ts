export interface AndroidFile {
  filename: string;
  category: 'manifest' | 'gradle' | 'room' | 'repository' | 'viewmodel' | 'compose_ui' | 'theme' | 'sample_data';
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
        android:theme="@style/Theme.MamanBebe"
        tools:targetApi="34">

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
    description: 'Material 3 Soft Pastel ColorScheme (Rose, Sage, Soft Lavender) & Typography Tokens',
    code: `package com.maman.bebe.tracker.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Soft Pastel Palette Tailored for Maternity & Newborn Comfort
val MamanRosePrimary = Color(0xFFD9777F)
val MamanRoseContainer = Color(0xFFFBEAEB)
val MamanSageSecondary = Color(0xFF6B8E76)
val MamanSageContainer = Color(0xFFEAF1EB)
val MamanLavenderTertiary = Color(0xFF8C7AA9)
val MamanLavenderContainer = Color(0xFFF2EEF8)
val MamanBackgroundLight = Color(0xFFFAF8F5)
val MamanSurfaceLight = Color(0xFFFFFFFF)

private val LightColorScheme = lightColorScheme(
    primary = MamanRosePrimary,
    onPrimary = Color.White,
    primaryContainer = MamanRoseContainer,
    onPrimaryContainer = Color(0xFF4C151A),
    secondary = MamanSageSecondary,
    onSecondary = Color.White,
    secondaryContainer = MamanSageContainer,
    onSecondaryContainer = Color(0xFF142E1B),
    tertiary = MamanLavenderTertiary,
    onTertiary = Color.White,
    tertiaryContainer = MamanLavenderContainer,
    onTertiaryContainer = Color(0xFF281C3F),
    background = MamanBackgroundLight,
    surface = MamanSurfaceLight,
    surfaceVariant = Color(0xFFF1EDE6)
)

@Composable
fun MamanBebeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme // Soft calming theme optimized for maternal care

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
];
