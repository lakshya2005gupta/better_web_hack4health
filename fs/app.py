import sys
import cv2
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QImage, QPixmap
from PyQt5.QtWidgets import QApplication, QLabel, QMainWindow, QVBoxLayout, QWidget
import pyautogui

class FaceScrollApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Eye Scroll App")
        self.setGeometry(100, 100, 640, 480)

        self.video_label = QLabel(self)
        self.video_label.setAlignment(Qt.AlignCenter)

        layout = QVBoxLayout()
        layout.addWidget(self.video_label)

        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            raise Exception("Could not open webcam")

        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        if self.face_cascade.empty():
            raise Exception("Failed to load face cascade classifier")
            
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
        if self.eye_cascade.empty():
            raise Exception("Failed to load eye cascade classifier")

        self.previous_y = None
        
        # Position-based scrolling instead of movement-based
        self.frame_height = 480  # Will be updated with actual frame height
        self.upper_threshold = 0.45  # Upper 45% of frame = scroll up (was 0.35)
        self.lower_threshold = 0.55  # Lower 55% of frame = scroll down (was 0.65)
        self.scroll_speed = 80       # Base scroll speed
        self.scroll_delay = 100      # Delay between scrolls in milliseconds
        self.last_scroll_time = 0
        
        # For smoothing eye position
        self.y_positions = []
        self.smoothing_window = 5

        self.timer = QTimer()
        self.timer.timeout.connect(self.update_frame)
        self.timer.start(30)  # approx 30 FPS

    def update_frame(self):
        ret, frame = self.cap.read()
        if not ret:
            return

        # Update frame height for position calculations
        self.frame_height = frame.shape[0]

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # First detect faces to improve eye detection accuracy
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        eyes = []
        if len(faces) > 0:
            # Look for eyes within the detected face region
            (fx, fy, fw, fh) = faces[0]
            face_roi = gray[fy:fy+fh, fx:fx+fw]
            eyes_in_face = self.eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=5, minSize=(10, 10))
            
            # Convert eye coordinates back to full frame coordinates
            for (ex, ey, ew, eh) in eyes_in_face:
                eyes.append((fx + ex, fy + ey, ew, eh))
        else:
            # If no face detected, try to detect eyes in the whole frame
            try:
                eyes = self.eye_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(15, 15))
            except Exception as e:
                print(f"Error in eye detection: {e}")

        if len(eyes) > 0:
            # Use the first detected eye (or average of both eyes if multiple detected)
            if len(eyes) >= 2:
                # If multiple eyes detected, use the average position
                avg_x = sum([x + w//2 for x, y, w, h in eyes]) // len(eyes)
                avg_y = sum([y + h//2 for x, y, w, h in eyes]) // len(eyes)
                center_y = avg_y
                
                # Draw rectangles around all detected eyes
                for (x, y, w, h) in eyes:
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)  # Red for eyes
            else:
                # Single eye detected
                (x, y, w, h) = eyes[0]
                center_y = y + h // 2
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)  # Red for eye
            
            # Add current position to smoothing
            self.y_positions.append(center_y)
            if len(self.y_positions) > self.smoothing_window:
                self.y_positions.pop(0)
            
            # Calculate smoothed position
            smoothed_y = sum(self.y_positions) / len(self.y_positions)
            
            # Calculate relative position in frame (0.0 = top, 1.0 = bottom)
            relative_position = smoothed_y / self.frame_height
            
            # Check if enough time has passed since last scroll
            import time
            current_ms = int(time.time() * 1000)
            
            if current_ms - self.last_scroll_time > self.scroll_delay:
                if relative_position < self.upper_threshold:
                    # Eyes in upper part - scroll up
                    # Calculate intensity based on how high the eyes are
                    intensity = (self.upper_threshold - relative_position) / self.upper_threshold
                    scroll_amount = int(self.scroll_speed * (0.5 + intensity))
                    pyautogui.scroll(scroll_amount)
                    self.last_scroll_time = current_ms
                    print(f"👀 UP - Position: {relative_position:.2f}, Scrolling up: {scroll_amount}")
                    
                elif relative_position > self.lower_threshold:
                    # Eyes in lower part - scroll down
                    # Calculate intensity based on how low the eyes are
                    intensity = (relative_position - self.lower_threshold) / (1.0 - self.lower_threshold)
                    scroll_amount = int(self.scroll_speed * (0.5 + intensity))
                    pyautogui.scroll(-scroll_amount)
                    self.last_scroll_time = current_ms
                    print(f"👀 DOWN - Position: {relative_position:.2f}, Scrolling down: {scroll_amount}")
                    
                # Remove the "middle" spam - only print when actually scrolling

        else:
            self.y_positions = []  # Reset smoothing when no eyes detected

        # Convert frame to QImage for display
        rgb_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_image.shape
        bytes_per_line = ch * w
        qt_image = QImage(rgb_image.data, w, h, bytes_per_line, QImage.Format_RGB888)
        self.video_label.setPixmap(QPixmap.fromImage(qt_image))

    def closeEvent(self, event):
        self.cap.release()
        super().closeEvent(event)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = FaceScrollApp()
    window.show()
    sys.exit(app.exec_())
