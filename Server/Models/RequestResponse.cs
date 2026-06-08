namespace Models
{
    public class RequestResponse
    {

    }
    
    public class Response
    {
        public string? status { get; set; }
        public bool isError { get; set; }
        public string? message { get; set; }
        public object? data { get; set; }
    }
}