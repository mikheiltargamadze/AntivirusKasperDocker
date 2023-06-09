namespace uploadFile
{
    public class KasperResultAPI
    {
        public int ScannedObjects { get; set; }
        public int TotalDetectedObjects { get; set; }
        public int InfectedObjectsAndOtherObjects { get; set; }
        public int DisinfectedObjects { get; set; }
        public int MovedToStorage { get; set; }
        public int RemovedObjects { get; set; }
        public int NotDisinfectedObjects { get; set; }
        public int ScanErrors { get; set; }
        public int PasswordprotectedObjects { get; set; }
        public int Skipped { get; set; } 
    }
}
