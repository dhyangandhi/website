<?php
// CONNECT TO DATABASE
$conn = mysqli_connect("localhost", "root", "", "registration");

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// CHECK IF FORM SUBMITTED
if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $fullname = $_POST['FullName'];
    $username = $_POST['UserName'];
    $email = $_POST['email'];
    $phone = $_POST['PhoneNumber'];
    $password = $_POST['Password'];
    $confirm = $_POST['ConfirmPassword'];

    if ($password !== $confirm) {
        die("passwords do not match.");
    }

    // Insert Query
    $sql = "INSERT INTO users (FullName, UserName, Email, PhoneNumber, Password)
            VALUES ('$fullname', '$username', '$email', '$phone', '$password')";

    if (mysqli_query($conn, $sql)) {
        echo "Registration successful!";
    } else {
        echo "Error: " . mysqli_error($conn);
    }
}
?>
