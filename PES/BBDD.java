import io.ebean.Model;
import io.ebean.annotation.DbJson;
import javax.persistence.*;
import java.util.List;

@Entity
public class BBDD extends Model {
    @Id
    public Long id;
    public String nombre;
    public String pais;
    public String sector;
}

@Entity
public class Barco extends Model {
    @Id
    public Long id;
    public String nombre;
    public String imo;
    @ManyToOne
    public BBDD empresa;
    public String tipo;
    public String bandera;
    public int añoFabricacion;
}

@Entity
public class Ubicacion extends Model {
    @Id
    public Long id;
    @ManyToOne
    public Barco barco;
    public double latitud;
    public double longitud;
    public String fechaHora;
}

@Entity
public class Puerto extends Model {
    @Id
    public Long id;
    public String nombre;
    public String pais;
    public String ciudad;
    public double latitud;
    public double longitud;
}

@Entity
public class Emision extends Model {
    @Id
    public Long id;
    @ManyToOne
    public Puerto puerto;
    public String fecha;
    public double latitud;
    public double longitud;
    public double co2;
    public double so2;
    public double no2;
}
