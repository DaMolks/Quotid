package com.quotid;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.RemoteInput;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class AdvancedNotificationModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AdvancedNotification";
    private static final String ADVANCED_CHANNEL_ID = "advanced-notifications";
    private static final String CHECKLIST_CHANNEL_ID = "checklist-notifications";
    
    private final ReactApplicationContext reactContext;
    private NotificationManager notificationManager;

    public AdvancedNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.notificationManager = (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        
        // Créer les canaux de notification au démarrage du module
        createNotificationChannels();
    }

    @Override
    public String getName() {
        return "AdvancedNotification";
    }
    
    private void createNotificationChannels() {
        // Créer les canaux uniquement sur Android O et supérieur
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Canal pour les notifications avancées
            NotificationChannel advancedChannel = new NotificationChannel(
                    ADVANCED_CHANNEL_ID,
                    "Notifications Avancées",
                    NotificationManager.IMPORTANCE_HIGH
            );
            advancedChannel.setDescription("Canal pour les notifications avancées");
            advancedChannel.enableVibration(true);
            advancedChannel.enableLights(true);
            
            // Canal pour les notifications de liste cochable
            NotificationChannel checklistChannel = new NotificationChannel(
                    CHECKLIST_CHANNEL_ID,
                    "Listes Cochables",
                    NotificationManager.IMPORTANCE_HIGH
            );
            checklistChannel.setDescription("Canal pour les notifications de liste à cocher");
            checklistChannel.enableVibration(true);
            checklistChannel.enableLights(true);
            
            // Enregistrer les canaux
            notificationManager.createNotificationChannel(advancedChannel);
            notificationManager.createNotificationChannel(checklistChannel);
            
            Log.d(TAG, "Canaux de notification avancés créés");
        }
    }
    
    /**
     * Crée une notification avec une liste cochable.
     * 
     * @param title Le titre de la notification
     * @param content Le contenu de la notification
     * @param items Tableau des éléments de la liste
     * @param promise Promesse à résoudre
     */
    @ReactMethod
    public void showChecklistNotification(String title, String content, ReadableArray items, Promise promise) {
        try {
            // Générer un ID unique pour la notification
            int notificationId = new Random().nextInt(1000000);
            
            // Créer le constructeur de notification
            NotificationCompat.Builder builder = new NotificationCompat.Builder(reactContext, CHECKLIST_CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_notification)
                    .setContentTitle(title)
                    .setContentText(content)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_REMINDER)
                    .setAutoCancel(true);
            
            // Créer le style pour la grosse vue texte qui contiendra la liste
            NotificationCompat.BigTextStyle bigTextStyle = new NotificationCompat.BigTextStyle()
                    .setBigContentTitle(title)
                    .setSummaryText("Liste de tâches");
            
            // Construire le texte de la liste
            StringBuilder listText = new StringBuilder();
            for (int i = 0; i < items.size(); i++) {
                ReadableMap item = items.getMap(i);
                String itemText = item.getString("text");
                boolean checked = item.hasKey("checked") && item.getBoolean("checked");
                
                // Ajouter un symbole de case cochée ou non selon l'état
                listText.append(checked ? "☑ " : "☐ ")
                        .append(itemText)
                        .append("\n");
            }
            
            // Définir le texte de la liste dans le style
            bigTextStyle.bigText(listText.toString());
            
            // Ajouter le style à la notification
            builder.setStyle(bigTextStyle);
            
            // Ajouter des actions pour interagir avec la liste
            // Pour une vraie implémentation de liste cochable, il faudrait utiliser
            // des PendingIntent avec des BroadcastReceivers pour chaque élément
            
            // Créer un intent générique pour ouvrir l'application
            Intent intent = reactContext.getPackageManager().getLaunchIntentForPackage(reactContext.getPackageName());
            intent.putExtra("notification_id", notificationId);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    reactContext,
                    notificationId,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            // Ajouter l'intent à la notification
            builder.setContentIntent(pendingIntent);
            
            // Construire la notification
            Notification notification = builder.build();
            
            // Afficher la notification
            NotificationManagerCompat notificationManagerCompat = NotificationManagerCompat.from(reactContext);
            notificationManagerCompat.notify(notificationId, notification);
            
            // Résoudre la promesse avec l'ID de la notification
            WritableMap result = Arguments.createMap();
            result.putInt("id", notificationId);
            promise.resolve(result);
            
            Log.d(TAG, "Notification avec liste affichée, ID: " + notificationId);
        } catch (Exception e) {
            Log.e(TAG, "Erreur lors de l'affichage de la notification avec liste", e);
            promise.reject("notification_error", "Erreur lors de l'affichage de la notification: " + e.getMessage(), e);
        }
    }
    
    /**
     * Annule une notification par son ID.
     * 
     * @param notificationId L'ID de la notification à annuler
     * @param promise Promesse à résoudre
     */
    @ReactMethod
    public void cancelNotification(int notificationId, Promise promise) {
        try {
            notificationManager.cancel(notificationId);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("cancel_error", "Erreur lors de l'annulation de la notification", e);
        }
    }
}
