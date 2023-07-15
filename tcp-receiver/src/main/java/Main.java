import java.io.*;
import java.net.*;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    private static Set<String> clientSN = new HashSet<>();
    private static String token_ref = "uQOpixuDj/YtSlXjayO-dNBcsd2fKx14OBqMOmHikiUUXi6Zhg2UxufCQDg7ic=y/yn6i2VSV9K2EMxcGYpzrQSgDNgbbBBaWlc4Xlhc2mOhNAPAF?Y929cAUHXEj6GL5jzxhASk4Z6u?s/gdEjGXjP/PpQqDZvelyGnbhrZocCyYRxy!P5WXS!eu053XhUJV5zLl121glT?g54HPVX2kvvkyqENk1tWl3E/Otz-ErK7SItzubR59ElypGOPwm?f";

    //C:385:INFO

    public static void main(String[] args) throws UnknownHostException {

        //int port = 7777;
        //InetAddress addr = InetAddress.getByName("192.168.0.112");

        int port = 56566;
        InetAddress addr = InetAddress.getByName("10.0.0.11");

        try (ServerSocket serverSocket = new ServerSocket(port, 50, addr)) {

            System.out.println("Server is listening on port " + port);
            System.out.println("Addr " + addr);

            while (true) {
                Socket socket = serverSocket.accept();

                // Add a delay of 500 milliseconds
                Thread.sleep(500);

                byte[] bReceive = new byte[1024 * 1024 * 2];
                InputStream inputStream = socket.getInputStream();

                int bytesRead = inputStream.read(bReceive);
                if (bytesRead != -1) {
                    byte[] receivedData = new byte[bytesRead];
                    System.arraycopy(bReceive, 0, receivedData, 0, bytesRead);

                    Analysis(receivedData, socket);
                }
            }

        } catch (IOException ex) {
            System.out.println("Server exception: " + ex.getMessage());
            ex.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private static void Analysis(byte[] bReceive, Socket socket) throws IOException {
        //System.out.println(socket.getLocalSocketAddress());
        //System.out.println(socket.getRemoteSocketAddress());
        String strReceive = new String(bReceive, Charset.forName("US-ASCII"));
        //System.out.println(strReceive);

        if (strReceive.contains("cdata?")) {
            cdataProcess(bReceive, socket);
        } else if (strReceive.contains("getrequest?")) {
            //getrequestProcess(bReceive, socket);
            sendDataInGet(bReceive);
            sendDataToDevice("200 OK", "C:385:INFO", socket);
        } else if (strReceive.contains("devicecmd?")) {
            devicecmdProcess(bReceive, socket);
        }
    }



    private static void sendDataInGet(byte[] bReceive)  throws IOException {
        String sBuffer = new String(bReceive, Charset.forName("US-ASCII"));

        String machineSN = sBuffer.substring(sBuffer.indexOf("SN=") + 3);
        String SN = "";
        getNumber(machineSN, SN); // Get Serial Number of iclock Device

        int attIndex = sBuffer.indexOf("\r\n\r\n", 1);
        String attStr = sBuffer.substring(attIndex + 4);

        String pattern = "SN=(\\d+)";
        Pattern regex = Pattern.compile(pattern);
        Matcher matcher = regex.matcher(sBuffer);
        String snValue = "";

        if (matcher.find()) {
             snValue = matcher.group(1);
        } else {
            System.out.println("SN parameter not found.");
        }

        try {
            URL url = new URL("http://localhost:8081/v3/terminal/online");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setRequestProperty("x-token-ref", token_ref);
            String requestBody = "{\"sn\":\"" + snValue + "\"}";

            con.setDoOutput(true);
            DataOutputStream outputStream = new DataOutputStream(con.getOutputStream());
            outputStream.writeBytes(requestBody);
            outputStream.flush();
            outputStream.close();

            int responseCode = con.getResponseCode();
            System.out.println("::" + snValue + ":: > update online request status: " + responseCode);
            checkStampsToSend();
        } catch (Exception e) {
            System.out.println("::" + snValue + ":: > there was an error updating the status. Is the server online?");
        }
    }

    private static void saveAttlogForLater(String body) {
        String workingDirectory = System.getProperty("user.dir");
        String fileName = "stamps_to_update.txt";
        File file = new File(workingDirectory, fileName);

        try {
            FileWriter fileWriter = new FileWriter(file, true);

            BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);

            String textToAppend = body;
            bufferedWriter.write(textToAppend);
            bufferedWriter.newLine();

            bufferedWriter.close();
            System.out.println("Text appended to the file successfully.");
        } catch (IOException e) {
            System.out.println("An error occurred while appending to the file.");
            e.printStackTrace();
        }
    }

    private static void checkStampsToSend() {
        String workingDirectory = System.getProperty("user.dir");
        String fileName = "stamps_to_update.txt";
        File file = new File(workingDirectory, fileName);

        try {
            Scanner scanner = new Scanner(file);
            File tempFile = new File(workingDirectory, "temp.txt");
            BufferedWriter writer = new BufferedWriter(new FileWriter(tempFile));

            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                try {
                    URL url = new URL("http://localhost:8081/v3/terminal/log/add");
                    HttpURLConnection con = (HttpURLConnection) url.openConnection();
                    con.setRequestMethod("POST");
                    con.setRequestProperty("Content-Type", "application/json");
                    con.setRequestProperty("x-token-ref", token_ref);
                    String requestBody = line;

                    con.setDoOutput(true);
                    DataOutputStream outputStream = new DataOutputStream(con.getOutputStream());
                    outputStream.writeBytes(requestBody);
                    outputStream.flush();
                    outputStream.close();

                    int responseCode = con.getResponseCode();
                    System.out.println("::" + line + ":: > update attLog request status: " + responseCode);
                } catch (Exception e) {
                    System.out.println("::" + line + ":: > Error uploading the attlog. Is the server online?");
                    writer.write(line);
                    writer.newLine();
                }
            }

            writer.close();
            scanner.close();

            Path originalPath = file.toPath();
            Path tempPath = tempFile.toPath();
            Files.move(tempPath, originalPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            System.out.println("An error occurred while processing the file: " + fileName);
            e.printStackTrace();
        }
    }

    private static void  devicecmdProcess(byte[] bReceive, Socket remoteSocket) throws IOException {
        String sBuffer = new String(bReceive, StandardCharsets.US_ASCII).trim();
        String strReceive = sBuffer;
        String errMessage = "";
        String SN = "";
        String machineSN = sBuffer.substring(sBuffer.indexOf("SN=") + 3);
        getNumber(machineSN, SN); // GET OPTION FROM: Serial Number of iclock Device

        int index = strReceive.indexOf("ID=");
        sendDataToDevice("200 OK", "OK", remoteSocket);

        Pattern pattern = Pattern.compile("IPAddress=(\\d+\\.\\d+\\.\\d+\\.\\d+)");
        Matcher matcher = pattern.matcher(strReceive);

        if (matcher.find()) {
            String ipAddress = matcher.group(1);

            try {
                URL url = new URL("http://localhost:8081/v3/terminal/ip");
                HttpURLConnection con = (HttpURLConnection) url.openConnection();
                con.setRequestMethod("POST");
                con.setRequestProperty("Content-Type", "application/json");
                con.setRequestProperty("x-token-ref", token_ref);
                String requestBody = "{\"sn\":\"" + machineSN.split(" ")[0] + "\",\"ip\":\"" + ipAddress + "\"}";

                con.setDoOutput(true);
                DataOutputStream outputStream = new DataOutputStream(con.getOutputStream());
                outputStream.writeBytes(requestBody);
                outputStream.flush();
                outputStream.close();

                int responseCode = con.getResponseCode();
                System.out.println("::" + machineSN.split(" ")[0] + ":: > update IP request status: " + responseCode);
                checkStampsToSend();
            } catch (Exception e) {
                System.out.println("::" + machineSN.split(" ")[0] + ":: > error while updating the IP. Is the server on?");

            }

        } else {
            System.out.println("Error parsing the IP Address. Update skipped.");
        }
        try {
            remoteSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void getrequestProcess(byte[] bReceive, Socket remoteSocket) {
        String sBuffer = new String(bReceive, StandardCharsets.ISO_8859_1);
        String cmdString = "OK";
        String SN = getValueByNameInPushHeader(sBuffer, "SN");
        String ReplyCode = "200 OK";

        if (!clientSN.contains(SN)) {
            clientSN.add(SN);
        }

        String strDevInfo = getValueByNameInPushHeader(sBuffer, "INFO");
        if (strDevInfo == null || strDevInfo.isEmpty()) {
            cmdString = "OK";
        } else {
            //updateDeviceInfo(device, strDevInfo);
            cmdString = "OK";
        }

        sendDataToDevice(ReplyCode, cmdString, remoteSocket);
        try {
            remoteSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void cdataProcess(byte[] bReceive, Socket remoteSocket) throws IOException {
        String sBuffer = new String(bReceive, Charset.forName("US-ASCII"));
        String SN = getValueByNameInPushHeader(sBuffer, "SN");
        String ReplyCode = "200 OK";
        String strReply = "OK";

        if (sBuffer.substring(0, 3).equals("GET")) { // iclock option
            if (sBuffer.indexOf("options=all", 0) > 0) {
                ReplyCode = initDeviceConnect(SN, strReply);
                sendDataToDevice(ReplyCode, strReply, remoteSocket);
                remoteSocket.close();
                return;
            } else {
                ReplyCode = "400 Bad Request";
                strReply = "Unknown Command";
                sendDataToDevice(ReplyCode, strReply, remoteSocket);
                remoteSocket.close();
                return;
            }
        }

        if (sBuffer.substring(0, 4).equals("POST")) {
            // Only PUSH SDK Ver 2.0.1 (In Version 1.0 String for AttLog have different format, example: CHECK LOG: stamp=392232960 1       2012-03-14 17:39:00     0       0       0       1)
            // table=ATTLOG
            if (sBuffer.indexOf("Stamp", 1) > 0
                    && sBuffer.indexOf("OPERLOG", 1) < 0
                    && sBuffer.indexOf("ATTLOG", 1) > 0
                    && sBuffer.indexOf("OPLOG", 1) < 0) { // Upload AttLog
                attLog(sBuffer);
            }

            // table=OPERLOG
            if (sBuffer.indexOf("Stamp", 1) > 0
                    && sBuffer.indexOf("OPERLOG", 1) > 0
                    && sBuffer.indexOf("ATTLOG", 1) < 0) {
                operLog(sBuffer);
            }

        /*
        // customer
        if (sBuffer.indexOf("WORKCODE", 1) > 0) { // Upload workcode Info
            workcodeLog(sBuffer);
        }*/

            sendDataToDevice(ReplyCode, strReply, remoteSocket);
            remoteSocket.close();
        }
    }

    private static void operLog(String sBuffer) {
        String machineSN = sBuffer.substring(sBuffer.indexOf("SN=") + 3);
        String SN = "";
        getNumber(machineSN, SN); // Get Serial Number of iclock Device

        String machinestamp = sBuffer.substring(sBuffer.indexOf("Stamp=") + 6);
        String Stamp = "";
        getNumber(machinestamp, Stamp); // Get TimeStamp


        int operIndex = sBuffer.indexOf("\r\n\r\n", 1);
        String operStr = sBuffer.substring(operIndex + 4);

        //System.out.println(operStr);
    }

    // Helper method
    private static String  getValueByNameInPushHeader(String buffer, String name) {
        String[] splitStr = buffer.split("&|\\?|\\s");

        if (splitStr.length <= 0) {
            return null;
        }

        for (String tmpStr : splitStr) {
            if (tmpStr.contains(name + "=")) {
                return tmpStr.substring(tmpStr.indexOf(name + "=") + name.length() + 1);
            }
        }

        return null;
    }

    // Helper methods
    private static String initDeviceConnect(String SN, String strReply) {
        // Implement the logic for initializing device connection and generating reply code
        // ...
        if (!clientSN.contains(SN)) {
            clientSN.add(SN); // Add SN if not already present
        }

        return "200 OK"; // Return the generated reply code
    }

    private static void sendDataToDevice(String sStatusCode, String sDataStr, Socket mySocket) {
        byte[] bData = sDataStr.getBytes(StandardCharsets.UTF_8);
        String sHeader = "HTTP/1.1 " + sStatusCode + "\r\n";
        sHeader += "Content-Type: text/plain\r\n";
        sHeader += "Accept-Ranges: bytes\r\n";
        sHeader += "Date: " + ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.RFC_1123_DATE_TIME) + "\r\n";
        sHeader += "Content-Length: " + bData.length + "\r\n\r\n";

        sendToBrowser(sHeader.getBytes(StandardCharsets.UTF_8), mySocket);
        sendToBrowser(bData, mySocket);
    }

    private static void sendToBrowser(byte[] bSendData, Socket mySocket) {
        String errMessage = "";

        try {
            if (mySocket.isConnected()) {
                mySocket.getOutputStream().write(bSendData);
                mySocket.getOutputStream().flush();
            } else {
                errMessage = "Link Failed...";
            }
        } catch (IOException ex) {
            errMessage = ex.getMessage();
        }

        if (!errMessage.isEmpty()) {
            System.out.println(errMessage);
        }
    }

    private static void attLog(String sBuffer) throws IOException {
        String machineSN = sBuffer.substring(sBuffer.indexOf("SN=") + 3);
        String SN = "";
        getNumber(machineSN, SN); // Get Serial Number of iclock Device

        String machinestamp = sBuffer.substring(sBuffer.indexOf("Stamp=") + 6);
        String Stamp = "";
        getNumber(machinestamp, Stamp); // Get TimeStamp

        int attIndex = sBuffer.indexOf("\r\n\r\n", 1);
        String attStr = sBuffer.substring(attIndex + 4);

        String patternSn = "SN=(\\d+)";
        Pattern regex = Pattern.compile(patternSn);
        Matcher matcherSn = regex.matcher(sBuffer);
        String snValue = "";

        if (matcherSn.find()) {
            snValue = matcherSn.group(1);

            try {
                URL url = new URL("http://localhost:8081/v3/terminal/log/add");
                HttpURLConnection con = (HttpURLConnection) url.openConnection();
                con.setRequestMethod("POST");
                con.setRequestProperty("Content-Type", "application/json");
                con.setRequestProperty("x-token-ref", token_ref);
                String requestBody = "{\"sn\":\"" + snValue + "\",\"log\":\"" + attStr.replaceAll("\\t", "-").replaceAll("\\n", "") + "\"}";


                con.setDoOutput(true);
                DataOutputStream outputStream = new DataOutputStream(con.getOutputStream());
                outputStream.writeBytes(requestBody);
                outputStream.flush();
                outputStream.close();

                int responseCode = con.getResponseCode();
                System.out.println("::" + snValue + ":: > update attLog request status: " + responseCode);
                checkStampsToSend();
            } catch (Exception e) {
                System.out.println("::" + snValue + ":: > Error uploading the attlog. Is the server online? Saving the log for later.");
                String requestBody = "{\"sn\":\"" + snValue + "\",\"log\":\"" + attStr.replaceAll("\\t", "-").replaceAll("\\n", "") + "\"}";
                saveAttlogForLater(requestBody);
            }
        } else {
            System.out.println("Cannot update attLog, SN parse error");
        }
    }

    private static void getNumber(String sBuffer, String numberStr) {
        numberStr = "";

        for (int i = 0; i < sBuffer.length(); i++) {
            char c = sBuffer.charAt(i);
            if (c > 47 && c < 58) {
                numberStr += c;
            } else {
                break;
            }
        }
    }
}
