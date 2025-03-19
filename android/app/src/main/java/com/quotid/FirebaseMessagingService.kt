package com.quotid

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class QuotidFirebaseMessagingService : FirebaseMessagingService() {
    companion object {
        private const val TAG = "FCMService"
        private const val CHANNEL_ID = "firebase-notifications"
        private const val CHANNEL_NAME = "Firebase Notifications"
        private const val CHANNEL_DESCRIPTION = "Notifications from Quotid"
    }

    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed token: $token")
        // Vous pouvez envoyer ce token à votre serveur si nécessaire
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        Log.d(TAG, "Message reçu de: ${remoteMessage.from}")

        // Vérifier si le message contient une payload de notification
        remoteMessage.notification?.let { notification ->
            Log.d(TAG, "Message de notification: ${notification.title} / ${notification.body}")
            
            // Afficher la notification
            showNotification(notification.title, notification.body)
        }

        // Vérifier si le message contient des données
        if (remoteMessage.data.isNotEmpty()) {
            Log.d(TAG, "Message data payload: ${remoteMessage.data}")
            
            // Si les données contiennent un titre et un corps, afficher une notification
            val title = remoteMessage.data["title"]
            val body = remoteMessage.data["body"]
            if (!title.isNullOrEmpty() && !body.isNullOrEmpty()) {
                showNotification(title, body, remoteMessage.data)
            }
        }
    }

    private fun showNotification(title: String?, body: String?, data: Map<String, String> = emptyMap()) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Créer le canal de notification pour Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESCRIPTION
                enableLights(true)
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Créer l'intent pour ouvrir l'application quand on clique sur la notification
        val intent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            
            // Ajouter les données de la notification comme extras à l'intent
            data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Construire la notification
        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info) // Icône par défaut
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        // Afficher la notification
        val notificationId = System.currentTimeMillis().toInt()
        notificationManager.notify(notificationId, notificationBuilder.build())
    }
}
